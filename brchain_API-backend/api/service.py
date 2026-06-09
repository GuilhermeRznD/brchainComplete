import json
from datetime import datetime, timezone

from api.classifier import NewsClassifier
from api.config import (
    DEFAULT_ARTICLE_LIMIT,
    DEFAULT_EVENT_LIMIT,
    DEFAULT_FEED_LIMIT,
    DEFAULT_USER_ID,
    TAGS_FILE,
)
from api.deduplication import NewsDeduplicator
from api.gnews_client import GNewsClient
from api.mongo_repository import MongoRepository
from api.recommender import NewsRecommender
from api.schemas import (
    ArticleListResponse,
    ArticleResponse,
    FeedbackResponse,
    FeedResponse,
    HealthResponse,
    IngestionResponse,
    IngestionStatsResponse,
    ProfileResponse,
    RankingEntryResponse,
    UserEventResponse,
)


def load_categories() -> list[dict]:
    """Carrega e valida as categorias base usadas na classificacao das noticias."""
    with TAGS_FILE.open("r", encoding="utf-8") as file:
        categories = json.load(file)

    required_keys = {"nome", "keywords", "sinonimos", "ativa", "peso_global"}
    for i, category in enumerate(categories):
        missing = required_keys - set(category.keys())
        if missing:
            raise ValueError(
                f"Categoria no indice {i} do Tags.json esta incompleta. "
                f"Campos ausentes: {missing}"
            )

    return categories


class NewsService:
    """Orquestra o fluxo da aplicacao entre cliente, ranking e persistencia."""

    def __init__(self, repository, client=None, classifier=None, deduplicator=None, categories=None):
        self.categories = categories or load_categories()
        self.repository = repository
        self.client = client or GNewsClient()
        self.classifier = classifier or NewsClassifier(self.categories)
        self.deduplicator = deduplicator or NewsDeduplicator()
        self.recommender = NewsRecommender(
            self.client,
            self.classifier,
            self.repository,
            self.deduplicator,
        )

    @classmethod
    def build_default(cls) -> "NewsService":
        """Monta a configuracao padrao do projeto usando o MongoDB local/configurado."""
        repository = MongoRepository().connect()
        return cls(repository=repository)

    def healthcheck(self) -> HealthResponse:
        """Retorna um retrato rapido da saude da API e do banco."""
        self.repository.ping()
        return HealthResponse(
            status="ok",
            mongodb="connected",
            checked_at=datetime.now(timezone.utc),
            collections=self.repository.get_collection_counts(),
        )

    async def ingest(self, user_id: str = DEFAULT_USER_ID) -> IngestionResponse:
        """Executa uma rodada de ingestao e devolve estatisticas resumidas."""
        stats = await self.recommender.ingestir_noticias(user_id=user_id)
        
        clean_stats = {
            "fetched": int(stats.get("fetched", 0) or 0),
            "unique": int(stats.get("unique", 0) or 0),
            "inserted": int(stats.get("inserted", 0) or 0),
        }
        
        return IngestionResponse(
            user_id=user_id,
            stats=IngestionStatsResponse(**clean_stats),
            executed_at=datetime.now(timezone.utc),
        )

    async def get_feed(
        self,
        user_id: str,
        limit: int = DEFAULT_FEED_LIMIT,
        refresh: bool = False,
        track_impressions: bool = True,
    ) -> FeedResponse:
        """Gera o feed final com ordenacao matemática e personalizada baseada no perfil NoSQL."""
        # 1. Recupera a lista de artigos brutos aprovados/elegíveis capturados pelo recommender
        articles = await self.recommender.buscar_noticias(
            user_id=user_id,
            limit=100,  # Aumentamos a busca interna para ter mais margem de ranqueamento
            refresh=refresh,
        )

        # 2. Busca o documento de preferências reais do usuário no MongoDB
        profile_document = self.repository.get_profile_document(user_id)
        
        if profile_document and "preferences" in profile_document:
            preferencias = profile_document["preferences"] # ex: {"Nutrição": 5.0, "Exercícios": 2.0}
            
            # 3. Aplica a Lógica de Recomendação (Algoritmo Content-Based)
            for article in articles:
                score_personalizado = 0.0
                cat_dominante = article.get("dominant_category", "Geral")
                sub_categorias = article.get("categories", [])

                # Se o usuário possui afinidade com a categoria dominante da notícia, ganha peso cheio
                if cat_dominante in preferencias:
                    score_personalizado += preferencias[cat_dominante] * 2.0
                
                # Incrementa o score se houver match com as demais subcategorias marcadas na notícia
                for cat in sub_categorias:
                    if cat in preferencias:
                        score_personalizado += preferencias[cat] * 1.0

                # Injeta temporariamente o score calculado no objeto para ordenação
                article["_sorting_score"] = score_personalizado

            # 4. Reorganiza as recomendações colocando os de maior interesse no topo
            articles.sort(key=lambda x: x.get("_sorting_score", 0.0), reverse=True)

        # Trunca o feed para respeitar o limite solicitado pela tela do celular
        articles = articles[:limit]

        # Controle de impressões das notícias exibidas na Home
        if track_impressions:
            self.repository.increment_article_impressions(
                [article.get("_id") for article in articles if article.get("_id")]
            )
            for article in articles:
                article["impression_count"] = int(article.get("impression_count", 0) or 0) + 1

        # 5. Sanatiza de forma estrita os contadores do dicionário last_ingestion para evitar quebras nativas
        raw_ingestion = self.recommender.last_ingestion or {}
        clean_ingestion = {
            "fetched": int(raw_ingestion.get("fetched", 0) or 0),
            "unique": int(raw_ingestion.get("unique", 0) or 0),
            "inserted": int(raw_ingestion.get("inserted", 0) or 0),
        }

        return FeedResponse(
            user_id=user_id,
            limit=limit,
            refresh=refresh,
            generated_at=datetime.now(timezone.utc),
            ingestion=IngestionStatsResponse(**clean_ingestion), # Ingestão 100% tipada como inteiros puros
            items=[self._serialize_article(a) for a in articles],
        )

    def list_articles(
        self,
        limit: int = DEFAULT_ARTICLE_LIMIT,
        category: str | None = None,
        source_name: str | None = None,
        status: str | None = None,
        category_admin: str | None = None,
        topic: str | None = None,
    ) -> ArticleListResponse:
        """Lista artigos persistidos com filtros simples para exploracao e debug."""
        articles = self.repository.list_articles(
            limit=limit,
            category=category,
            source_name=source_name,
            status=status,
            category_admin=category_admin,
            topic=topic,
        )
        return ArticleListResponse(
            limit=limit,
            category=category,
            source_name=source_name,
            status=status,
            items=[self._serialize_article(a) for a in articles],
        )

    def moderate_article(
        self,
        article_id: str,
        status: str,
        category_admin: str | None = None,
        topic: str | None = None,
        moderated_by: str | None = None,
    ) -> ArticleResponse:
        """Aprova ou reprova um artigo, gravando categoria e topico escolhidos pelo admin."""
        if status == "approved" and not category_admin:
            raise ValueError("Para aprovar uma noticia, informe 'category_admin'.")

        updated = self.repository.update_article_moderation(
            article_id=article_id,
            status=status,
            category_admin=category_admin,
            topic=topic,
            moderated_by=moderated_by,
        )
        if updated is None:
            raise LookupError("Artigo nao encontrado para moderacao.")
        return self._serialize_article(updated)

    def get_profile(self, user_id: str, events_limit: int = DEFAULT_EVENT_LIMIT) -> ProfileResponse:
        """Expoe o estado atual do perfil e o historico recente de interacoes."""
        profile_document = self.repository.get_profile_document(user_id) or {}
        profile = self.repository.get_profile(user_id, self.categories)
        recent_events = self.repository.get_user_events(user_id, limit=events_limit)

        return ProfileResponse(
            user_id=user_id,
            preferences=profile.preferences,
            normalized_preferences=profile.pesos_normalizados(),
            updated_at=profile_document.get("updated_at"),
            created_at=profile_document.get("created_at"),
            recent_events=[self._serialize_event(e) for e in recent_events],
        )

    def submit_feedback(self, user_id: str, article_id: str, action: str) -> FeedbackResponse:
        """Aplica feedback ao perfil, ajusta engajamento e registra auditoria com conversão estrita de tipos."""
        article = self.repository.get_article_by_id(article_id)
        if article is None:
            raise LookupError("Artigo nao encontrado para o feedback informado.")

        ranking = self.recommender.processar_feedback(
            article,
            acao=action,
            user_id=user_id,
        )

        if action == "gostei":
            self.repository.increment_article_clicks(article_id)

        self.repository.record_user_event(
            user_id=user_id,
            article=article,
            action=action,
            metadata={
                "top_categories_after_feedback": [
                    {"category": cat, "score": float(score)}  # Garante float puro
                    for cat, score in ranking[:5]
                ]
            },
        )

        # Monta a lista de ranking garantindo matematicamente que o score é float puro (Double)
        clean_ranking = []
        for cat, score in ranking[:10]:
            try:
                score_float = float(score)
            except (ValueError, TypeError):
                score_float = 0.0
            clean_ranking.append(RankingEntryResponse(category=cat, score=round(score_float, 4)))

        return FeedbackResponse(
            user_id=user_id,
            article_id=article_id,
            action=action,
            dominant_category=article.get("dominant_category", "Geral"),
            ranking=clean_ranking,  # Lista 100% convertida e segura para o Java
            updated_at=datetime.now(timezone.utc),
        )

    def close(self) -> None:
        """Fecha a conexao do repositorio quando a aplicacao encerra."""
        self.repository.close()

    # ------------------------------------------------------------------
    # Serializadores privados — convertem documentos Mongo em modelos Pydantic
    # ------------------------------------------------------------------

    def _serialize_article(self, article: dict) -> ArticleResponse:
        """Serializa os dados do MongoDB convertendo todos os tipos numéricos e temporais para blindar o app."""
        
        # 1. Trata e normaliza de forma estrita o campo de data publicado (published_at) para formato String ISO 8601
        published_at_raw = article.get("published_at")
        if isinstance(published_at_raw, datetime):
            published_at = published_at_raw.isoformat().replace("+00:00", "Z")
        elif published_at_raw:
            published_at = str(published_at_raw)
        else:
            published_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        # 2. Garante coerção forçada do raw_score para float Puro (Double nativo do Java)
        raw_score = article.get("raw_score")
        if raw_score is not None:
            try:
                raw_score = float(raw_score)
            except (ValueError, TypeError):
                raw_score = 0.0
        else:
            raw_score = 0.0

        # 3. Garante coerção forçada do score para float Puro (Double nativo do Java)
        score = article.get("score")
        if score is not None:
            try:
                score = float(score)
            except (ValueError, TypeError):
                score = 0.0
        else:
            score = 0.0

        # 4. Garante que o dicionário de scores internos contenha apenas floats puros nos valores
        raw_norm_scores = article.get("normalized_category_scores") or {}
        clean_normalized_scores = {}
        if isinstance(raw_norm_scores, dict):
            for cat, val in raw_norm_scores.items():
                try:
                    clean_normalized_scores[cat] = float(val)
                except (ValueError, TypeError):
                    clean_normalized_scores[cat] = 0.0

        # 5. Garante contadores de engajamento estritamente mapeados como inteiros válidos
        try:
            click_count = int(article.get("click_count", 0) or 0)
        except (ValueError, TypeError):
            click_count = 0

        try:
            impression_count = int(article.get("impression_count", 0) or 0)
        except (ValueError, TypeError):
            impression_count = 0

        return ArticleResponse(
            id=str(article.get("_id")) if article.get("_id") else article.get("url_hash", ""),
            title=article.get("title"),
            description=article.get("description"),
            content=article.get("content"),
            url=article.get("url"),
            image=article.get("image"),
            source_name=article.get("source_name") or (article.get("source") or {}).get("name"),
            published_at=published_at,
            categories=article.get("categories", []),
            dominant_category=article.get("dominant_category", "Geral"),
            score=score,
            raw_score=raw_score,
            click_count=click_count,
            impression_count=impression_count,
            normalized_category_scores=clean_normalized_scores,
            status=article.get("status", "pending"),
            category_admin=article.get("category_admin"),
            topic=article.get("topic"),
            moderated_at=article.get("moderated_at"),
            moderated_by=article.get("moderated_by"),
        )

    def _serialize_event(self, event: dict) -> UserEventResponse:
        return UserEventResponse(
            id=str(event.get("_id")) if event.get("_id") else "",
            action=event.get("action"),
            article_id=event.get("article_id"),
            article_title=event.get("article_title"),
            dominant_category=event.get("dominant_category"),
            categories=event.get("categories", []),
            created_at=event.get("created_at"),
            metadata=event.get("metadata", {}),
        )
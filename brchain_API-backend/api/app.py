import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from api.config import (
    AUTO_INGEST_ON_STARTUP,
    DEFAULT_ARTICLE_LIMIT,
    DEFAULT_EVENT_LIMIT,
    DEFAULT_FEED_LIMIT,
    DEFAULT_USER_ID,
    ENABLE_SCHEDULER,
    SEED_DEMO_ON_STARTUP,
)
from api.seed import seed_demo
from api.schemas import (
    ArticleListResponse,
    ArticleResponse,
    ClickRequest,
    FeedbackRequest,
    FeedbackResponse,
    FeedResponse,
    HealthResponse,
    IngestionResponse,
    LoginRequest,
    LoginResponse,
    ModerationRequest,
    ProfileResponse,
    TagItem,
    TagsResponse,
    UserRegisterRequest,   # <-- Novo schema importado
    UserRegisterResponse,  # <-- Novo schema importado
)
from api.service import NewsService, load_categories
from scheduler import build_background_scheduler

logger = logging.getLogger(__name__)


def create_app(service=None) -> FastAPI:
    """Cria a API FastAPI com injecao opcional de servico para testes."""
    external_service = service is not None

    @asynccontextmanager
    async def lifespan(app_instance):
        """Controla startup e shutdown da API, incluindo scheduler e conexoes."""
        current_service = service or NewsService.build_default()
        scheduler = None
        app_instance.state.news_service = current_service

        if not external_service and ENABLE_SCHEDULER:
            scheduler = build_background_scheduler(current_service)
            scheduler.start()
            logger.info("Scheduler de ingestao iniciado.")

        if not external_service and AUTO_INGEST_ON_STARTUP:
            try:
                await current_service.ingest(DEFAULT_USER_ID)
                logger.info("Ingestao inicial executada no startup.")
            except Exception:
                logger.exception("Falha na ingestao automatica de startup.")

        if not external_service and SEED_DEMO_ON_STARTUP:
            try:
                inserted = seed_demo(current_service.repository)
                if inserted:
                    logger.info("Seed demo inseriu %d noticias pendentes.", inserted)
                else:
                    logger.info("Seed demo ignorado: base ja contem noticias.")
            except Exception:
                logger.exception("Falha ao popular seed demo.")

        try:
            yield
        finally:
            if scheduler is not None:
                scheduler.shutdown(wait=False)
            if not external_service:
                current_service.close()

    app = FastAPI(
        title="BRChain News API",
        version="0.3.0",
        lifespan=lifespan,
    )

    # CORS — permite que frontends em qualquer origem consumam a API em desenvolvimento.
    # Em producao, restrinja `allow_origins` ao dominio do seu frontend.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def get_service() -> NewsService:
        return app.state.news_service

    @app.get("/health", response_model=HealthResponse)
    async def health():
        """Endpoint de healthcheck usado para validar API e banco."""
        try:
            return get_service().healthcheck()
        except Exception as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc

    @app.get("/feed/{user_id}", response_model=FeedResponse)
    async def get_feed(
        user_id: str,
        limit: int = Query(DEFAULT_FEED_LIMIT, ge=1, le=100),
        refresh: bool = False,
    ):
        """Retorna o feed ranqueado do usuario."""
        try:
            return await get_service().get_feed(user_id=user_id, limit=limit, refresh=refresh)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

    @app.post("/ingest", response_model=IngestionResponse)
    async def ingest(user_id: str = DEFAULT_USER_ID):
        """Dispara uma ingestao manual para facilitar testes e operacao."""
        try:
            return await get_service().ingest(user_id=user_id)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

    @app.get("/articles", response_model=ArticleListResponse)
    async def list_articles(
        limit: int = Query(DEFAULT_ARTICLE_LIMIT, ge=1, le=100),
        category: str | None = None,
        source_name: str | None = None,
        status: str | None = Query(None, pattern="^(pending|approved|rejected)$"),
        category_admin: str | None = None,
    ):
        """Lista artigos persistidos com filtros simples (status, categoria, fonte)."""
        try:
            return get_service().list_articles(
                limit=limit,
                category=category,
                source_name=source_name,
                status=status,
                category_admin=category_admin,
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    @app.get("/articles/{article_id}", response_model=ArticleResponse)
    async def get_article(article_id: str):
        """Busca um unico artigo pelo seu id Mongo (usado na tela de detalhe)."""
        try:
            article = get_service().repository.get_article_by_id(article_id)
            if article is None:
                raise HTTPException(status_code=404, detail="Artigo nao encontrado.")
            return get_service()._serialize_article(article)
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    # ------------------------------------------------------------------
    # MODERACAO — usadas pelo painel administrativo 
    # ------------------------------------------------------------------

    @app.get("/moderation/pending", response_model=ArticleListResponse)
    async def list_pending(limit: int = Query(DEFAULT_ARTICLE_LIMIT, ge=1, le=200)):
        """Lista as noticias brutas aguardando triagem do administrador."""
        try:
            return get_service().list_articles(limit=limit, status="pending")
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    @app.get("/moderation/approved", response_model=ArticleListResponse)
    async def list_approved(
        limit: int = Query(DEFAULT_ARTICLE_LIMIT, ge=1, le=200),
        category_admin: str | None = None,
    ):
        """Lista as noticias ja aprovadas pelo administrador."""
        try:
            return get_service().list_articles(
                limit=limit,
                status="approved",
                category_admin=category_admin,
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    @app.get("/moderation/rejected", response_model=ArticleListResponse)
    async def list_rejected(limit: int = Query(DEFAULT_ARTICLE_LIMIT, ge=1, le=200)):
        """Lista as noticias rejeitadas — nao chegam ao feed do usuario."""
        try:
            return get_service().list_articles(limit=limit, status="rejected")
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    @app.patch("/moderation/{article_id}", response_model=ArticleResponse)
    async def moderate_article(article_id: str, payload: ModerationRequest):
        """Aprova ou reprova um artigo. Em aprovacoes, exige categoria e (opcional) topico."""
        try:
            return get_service().moderate_article(
                article_id=article_id,
                status=payload.status,
                category_admin=payload.category_admin,
                topic=payload.topic,
                moderated_by=payload.moderated_by,
            )
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    # ------------------------------------------------------------------
    # PUBLIC — consumido pelo app mobile (Guilherme): so noticias aprovadas
    # ------------------------------------------------------------------

    @app.get("/public/articles", response_model=ArticleListResponse)
    async def list_public_articles(
        limit: int = Query(DEFAULT_ARTICLE_LIMIT, ge=1, le=100),
        category: str | None = None,
        topic: str | None = None,
    ):
        """Feed publico: somente noticias aprovadas, filtravel por categoria e/ou topico."""
        try:
            return get_service().list_articles(
                limit=limit,
                status="approved",
                category_admin=category,
                topic=topic,
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    @app.get("/tags", response_model=TagsResponse)
    async def list_tags():
        """Lista as categorias e topicos disponiveis para o modal de aprovacao."""
        try:
            categorias_raw = load_categories()
            categorias = [
                TagItem(
                    nome=c.get("nome"),
                    keywords=c.get("keywords", []),
                    sinonimos=c.get("sinonimos", []),
                )
                for c in categorias_raw
                if c.get("ativa", True)
            ]
            topicos = sorted({
                kw for c in categorias for kw in c.keywords + c.sinonimos
            })
            return TagsResponse(categorias=categorias, topicos=topicos)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    # ------------------------------------------------------------------
    # AUTH — Fluxos de validacao, sessao e cadastro real de usuarios
    # ------------------------------------------------------------------

    @app.post("/auth/login", response_model=LoginResponse)
    async def login(payload: LoginRequest):
        """Login real consultando as credenciais e o nível de acesso no MongoDB."""
        if not payload.email or not payload.senha:
            raise HTTPException(status_code=400, detail="Email e senha são obrigatórios.")

        repo = get_service().repository
        cleaned_email = payload.email.lower().strip()

        # 1. Busca o usuário na coleção de perfis reais do banco de dados
        user_document = repo.user_profiles.find_one({"email": cleaned_email})

        # 2. Se não encontrar o documento do e-mail, barra o acesso
        if not user_document:
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

        # 3. Valida se a senha enviada pelo app bate com a salva na coleção
        if user_document.get("password") != payload.senha:
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

        # 4. Lê o nível de acesso (role) salvo diretamente no banco de dados
        user_role = user_document.get("role", "user")

        return LoginResponse(
            userId=cleaned_email,
            userName=user_document.get("name", user_document.get("userName", cleaned_email.split("@")[0].capitalize())),
            userRole=user_role,
            token=f"stub-token-{cleaned_email}",
        )

    @app.post("/auth/register", response_model=UserRegisterResponse, status_code=201)
    async def register(payload: UserRegisterRequest):
        """Endpoint real para cadastrar um usuario diretamente no MongoDB."""
        repo = get_service().repository
        cleaned_email = payload.email.lower().strip()
        
        # 1. Verifica se o e-mail já existe na coleção user_profiles para impedir duplicidade
        existing_user = repo.user_profiles.find_one({"email": cleaned_email})
        if existing_user:
            raise HTTPException(status_code=409, detail="Este email já está cadastrado.")
        
        try:
            # 2. Persiste os dados estruturados no repositório MongoDB
            inserted_id = repo.create_user_profile(
                name=payload.name,
                email=payload.email,
                phone=payload.phone,
                password=payload.password
            )
            
            return UserRegisterResponse(
                message="Sua conta foi criada com sucesso de verdade!",
                user_id=inserted_id
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Erro interno de persistência: {str(exc)}")

    @app.get("/profiles/{user_id}", response_model=ProfileResponse)
    async def get_profile(
        user_id: str,
        events_limit: int = Query(DEFAULT_EVENT_LIMIT, ge=1, le=50),
    ):
        """Expoe as preferencias e os eventos recentes do usuario."""
        try:
            return get_service().get_profile(user_id=user_id, events_limit=events_limit)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    @app.post("/feed/{user_id}/feedback", response_model=FeedbackResponse)
    async def submit_feedback(user_id: str, payload: FeedbackRequest):
        """Recebe feedback explicito e atualiza o perfil do usuario."""
        try:
            return get_service().submit_feedback(
                user_id=user_id,
                article_id=payload.article_id,
                action=payload.action,
            )
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    @app.post("/feed/{user_id}/click", response_model=FeedbackResponse)
    async def register_click(user_id: str, payload: ClickRequest):
        """Atalho para tratar clique como um sinal positivo de interesse."""
        try:
            return get_service().submit_feedback(
                user_id=user_id,
                article_id=payload.article_id,
                action="gostei",
            )
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    return app


app = create_app()
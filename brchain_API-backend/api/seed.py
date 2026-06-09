"""Popula o MongoDB com noticias de demonstracao e usuarios padrao para o fluxo.

Usado quando SEED_DEMO_ON_STARTUP=true (tipicamente em USE_MOCK_DB=true ou dev local)
para que o painel administrativo ja tenha materia pendente e credenciais master assim que sobe.
"""
from datetime import datetime, timezone, timedelta


DEMO_ARTICLES = [
    {
        "title": "Avancos na prevencao de doencas cronicas",
        "description": "Pesquisas reforcam a importancia da prevencao contra diabetes, hipertensao e obesidade.",
        "content": "Estudos recentes mostram que pequenas mudancas de habito tem impacto significativo. O Ministerio da Saude tem investido em campanhas de conscientizacao.",
        "url": "https://www.gov.br/saude/avancos-prevencao",
        "image": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
        "source_name": "Ministerio da Saude",
        "categories": ["Doenças", "Prevenção"],
        "dominant_category": "Doenças",
    },
    {
        "title": "Nutricao no inverno: alimentos que reforcam imunidade",
        "description": "Especialistas listam frutas, legumes e graos integrais para a estacao mais fria.",
        "content": "Citrinos, oleaginosas e folhas verdes escuras sao apostas certeiras para manter as defesas em alta.",
        "url": "https://www.fiocruz.br/nutricao-inverno",
        "image": "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800",
        "source_name": "Fiocruz",
        "categories": ["Nutrição"],
        "dominant_category": "Nutrição",
    },
    {
        "title": "Treino de forca melhora qualidade do sono em adultos",
        "description": "Estudo aponta que sessoes regulares aumentam o sono profundo em ate 18%.",
        "content": "Atividade fisica intensa, pelo menos tres vezes por semana, esta associada a noites mais reparadoras.",
        "url": "https://www.who.int/treino-sono",
        "image": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
        "source_name": "OMS",
        "categories": ["Treino", "Sono"],
        "dominant_category": "Treino",
    },
    {
        "title": "Saude mental ganha espaco em campanhas de prevencao",
        "description": "Especialistas alertam para o aumento de casos de ansiedade no pos-pandemia.",
        "content": "Profissionais recomendam meditacao, exercicios leves e busca por acompanhamento profissional.",
        "url": "https://www.paho.org/saude-mental",
        "image": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800",
        "source_name": "OPAS",
        "categories": ["Saúde Mental"],
        "dominant_category": "Saúde Mental",
    },
    {
        "title": "Falta de sono afeta produtividade e saude emocional",
        "description": "Dormir menos de 6 horas por noite tem impacto direto na concentracao.",
        "content": "Pesquisadores enfatizam a importancia de uma rotina de sono consistente para preservar a saude.",
        "url": "https://www.sleepfoundation.org/sono-produtividade",
        "image": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800",
        "source_name": "Sleep Foundation",
        "categories": ["Sono"],
        "dominant_category": "Sono",
    },
    {
        "title": "Hidratacao adequada previne complicacoes no verao",
        "description": "Beber agua regularmente evita desidratacao e mantem a temperatura corporal estavel.",
        "content": "A recomendacao para adultos varia entre 2 e 3 litros por dia, conforme o nivel de atividade fisica.",
        "url": "https://www.fiocruz.br/hidratacao-verao",
        "image": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800",
        "source_name": "Fiocruz",
        "categories": ["Geral", "Prevenção"],
        "dominant_category": "Geral",
    },
    {
        "title": "Vacinacao infantil tem queda e preocupa especialistas",
        "description": "Cobertura vacinal abaixo da meta acende sinal de alerta em estados do Sudeste.",
        "content": "Campanhas locais buscam reverter a tendencia e proteger criancas contra sarampo e poliomielite.",
        "url": "https://www.gov.br/saude/vacinacao-infantil",
        "image": "https://images.unsplash.com/photo-1632571401005-458e9d244591?w=800",
        "source_name": "Ministerio da Saude",
        "categories": ["Doenças", "Prevenção"],
        "dominant_category": "Doenças",
    },
    {
        "title": "Dieta mediterranea reduz risco cardiovascular",
        "description": "Estudo de longo prazo confirma beneficios de azeite, peixes e vegetais.",
        "content": "Adesao consistente ao padrao alimentar mediterraneo reduz em ate 25% o risco de eventos cardiacos.",
        "url": "https://www.heart.org/dieta-mediterranea",
        "image": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800",
        "source_name": "American Heart Association",
        "categories": ["Nutrição", "Doenças"],
        "dominant_category": "Nutrição",
    },
]


def seed_demo(repository) -> int:
    """Insere noticias demo e os usuarios padrao no banco se nao existirem."""
    now = datetime.now(timezone.utc)
    
    # ------------------------------------------------------------------
    # SEED DE USUÁRIOS — Garante as contas iniciais de teste no sistema
    # ------------------------------------------------------------------
    
    # 1. Usuário Administrador Master
    admin_email = "admin@brchain.com"
    if not repository.user_profiles.find_one({"email": admin_email}):
        admin_payload = {
            "user_id": admin_email,
            "name": "Marcos ADM",
            "email": admin_email,
            "phone": "11999999999",
            "password": "123",
            "role": "admin",
            "preferences": {},
            "normalized_preferences": {},
            "created_at": now,
            "updated_at": now,
        }
        repository.user_profiles.insert_one(admin_payload)

    # 2. Usuário Comum Padrão (João)
    user_email = "joao@gmail.com"
    if not repository.user_profiles.find_one({"email": user_email}):
        user_payload = {
            "user_id": user_email,
            "name": "João Silva",
            "email": user_email,
            "phone": "11988888888",
            "password": "123",
            "role": "user",  # Cargo comum, cai direto no feed de notícias
            "preferences": {},
            "normalized_preferences": {},
            "created_at": now,
            "updated_at": now,
        }
        repository.user_profiles.insert_one(user_payload)

    # ------------------------------------------------------------------
    # SEED DE ARTIGOS — Popula os artigos pendentes de teste
    # ------------------------------------------------------------------
    if repository.articles.count_documents({}) > 0:
        return 0

    payloads = []
    for index, article in enumerate(DEMO_ARTICLES):
        payloads.append({
            **article,
            "url_hash": f"demo-{index}",
            "url_normalized": article["url"],
            "title_tokens": article["title"].lower().split(),
            "published_at": now - timedelta(hours=index * 3),
            "publishedAt": (now - timedelta(hours=index * 3)).isoformat(),
            "created_at": now,
            "last_seen_at": now,
            "click_count": 0,
            "impression_count": 0,
            "normalized_category_scores": {article["dominant_category"]: 1.0},
            "category_scores": {article["dominant_category"]: 1.0},
            "classifier_strength": 0.7,
            "source": {"name": article["source_name"]},
            "status": "pending",
            "category_admin": None,
            "topic": None,
        })

    repository.articles.insert_many(payloads)
    return len(payloads)
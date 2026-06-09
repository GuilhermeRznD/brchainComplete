"""Wrapper que sobe a mesma API do Ramon, mas com dois ajustes em runtime
(monkey-patch) sem editar nenhum arquivo do projeto original:

  1. Substitui as queries de cold-start que continham hifen ("bem-estar"),
     que a GNews interpreta como NOT e responde 400 Bad Request.
  2. Insere uma pausa de ~1.2s entre chamadas consecutivas a GNews para
     respeitar o limite do plano free (1 request/segundo).

Use este arquivo no lugar de main.py:
    ./.venv/bin/python main_gnews.py
"""

import asyncio

import uvicorn

import api.recommender as rec
from api.config import API_HOST, API_PORT, API_RELOAD


# ---------------------------------------------------------------------------
# Patch 1: queries de cold-start sem hifen
# ---------------------------------------------------------------------------
rec.COLD_START_QUERIES = [
    "saude OR bem estar",
    "nutricao OR alimentacao",
    "exercicio OR atividade fisica",
]


# ---------------------------------------------------------------------------
# Patch 2: throttle entre chamadas GNews (free tier = 1 req/s)
# ---------------------------------------------------------------------------
async def _ingestir_com_throttle(self, user_profile) -> None:
    queries = self.gerar_queries(user_profile)
    fetched: list[dict] = []
    for index, query in enumerate(queries):
        if index > 0:
            await asyncio.sleep(1.2)
        fetched.extend(await self.client.get_news(query=query))

    known = self.repository.get_recent_dedup_candidates()
    unique = self.deduplicator.deduplicate(fetched, known)
    enriched = [self._enrich_article(article) for article in unique]
    inserted = self.repository.upsert_articles(enriched)

    self.last_ingestion = {
        "fetched": len(fetched),
        "unique": len(unique),
        "inserted": inserted,
    }


rec.NewsRecommender._ingestir_noticias = _ingestir_com_throttle


# ---------------------------------------------------------------------------
# Sobe a API igual ao main.py
# ---------------------------------------------------------------------------
def main() -> None:
    uvicorn.run(
        "api.app:app",
        host=API_HOST,
        port=API_PORT,
        reload=API_RELOAD,
    )


if __name__ == "__main__":
    main()

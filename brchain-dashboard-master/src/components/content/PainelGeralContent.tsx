"use client";
import { useCallback, useEffect, useState } from "react";
import ModerationCard from "@/components/ui/ModerationCard";
import ApprovalModal from "@/components/ui/ApprovalModal";
import { api, Article } from "@/services/api";
import { getSession } from "@/lib/session";

type FetchState = "idle" | "loading" | "success" | "error";

const PainelGeralContent: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [state, setState] = useState<FetchState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modalArticle, setModalArticle] = useState<Article | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const [ingestMsg, setIngestMsg] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setState("loading");
    setErrorMsg(null);
    try {
      const data = await api.listPending(50);
      setArticles(data.items);
      setState("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Falha de rede ao buscar notícias pendentes."
      );
      setState("error");
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  async function handleReject(article: Article) {
    setBusyId(article.id);
    try {
      await api.moderate(article.id, {
        status: "rejected",
        moderated_by: getSession()?.userId,
      });
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
    } catch (err) {
      alert(
        `Falha ao reprovar a notícia: ${
          err instanceof Error ? err.message : "erro desconhecido"
        }`
      );
    } finally {
      setBusyId(null);
    }
  }

  function handleApprove(article: Article) {
    setModalArticle(article);
  }

  async function handleIngest() {
    setIngesting(true);
    setIngestMsg(null);
    try {
      const r = await api.ingest();
      setIngestMsg(
        `Buscou ${r.stats.fetched} • inseriu ${r.stats.inserted} nova(s).`
      );
      await fetchPending();
    } catch (err) {
      setIngestMsg(
        err instanceof Error
          ? `Falha: ${err.message}`
          : "Falha ao atualizar via GNews."
      );
    } finally {
      setIngesting(false);
    }
  }

  async function handlePublish(categoria: string, topico: string) {
    if (!modalArticle) return;
    setBusyId(modalArticle.id);
    try {
      await api.moderate(modalArticle.id, {
        status: "approved",
        category_admin: categoria,
        topic: topico || undefined,
        moderated_by: getSession()?.userId,
      });
      setArticles((prev) => prev.filter((a) => a.id !== modalArticle.id));
      setModalArticle(null);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[42px] font-bold text-black">Notícias Pendentes</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleIngest}
            disabled={ingesting}
            className="px-4 py-2 rounded-lg bg-[#1F6A56] text-white text-sm font-medium hover:bg-opacity-90 transition cursor-pointer disabled:opacity-50"
          >
            {ingesting ? "Buscando..." : "Atualizar via GNews"}
          </button>
          <button
            type="button"
            onClick={fetchPending}
            className="px-4 py-2 rounded-lg bg-[#0D3F33] text-white text-sm font-medium hover:bg-opacity-90 transition cursor-pointer"
          >
            Recarregar lista
          </button>
        </div>
      </div>

      {ingestMsg && (
        <p className="text-sm text-[#444] mb-4">{ingestMsg}</p>
      )}

      {state === "loading" && (
        <p className="text-[#666] text-lg">Carregando notícias da API...</p>
      )}

      {state === "error" && (
        <div className="bg-[#FDECEA] border border-[#F5C6C0] text-[#B71C1C] rounded-lg p-4 mb-6">
          <p className="font-bold mb-1">Não foi possível carregar.</p>
          <p className="text-sm mb-3">{errorMsg}</p>
          <button
            type="button"
            onClick={fetchPending}
            className="px-4 py-2 rounded-lg bg-[#B71C1C] text-white text-sm font-medium hover:bg-opacity-90 transition cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {state === "success" && articles.length === 0 && (
        <p className="text-[#666] text-lg">
          Nenhuma notícia pendente no momento. ✅
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {articles.map((article) => (
          <ModerationCard
            key={article.id}
            article={article}
            onApprove={handleApprove}
            onReject={handleReject}
            isBusy={busyId === article.id}
          />
        ))}
      </div>

      <ApprovalModal
        open={modalArticle !== null}
        articleTitle={modalArticle?.title || ""}
        onClose={() => setModalArticle(null)}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default PainelGeralContent;

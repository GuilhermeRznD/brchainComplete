"use client";
import { useCallback, useEffect, useState } from "react";
import ApprovalModal from "@/components/ui/ApprovalModal";
import ReaderModal from "@/components/ui/ReaderModal";
import { api, Article } from "@/services/api";
import { getSession } from "@/lib/session";

const NoticiasReprovadasContent: React.FC = () => {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readArticle, setReadArticle] = useState<Article | null>(null);
  const [approveArticle, setApproveArticle] = useState<Article | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listRejected(100);
      setItems(data.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao carregar reprovadas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openApprove(article: Article) {
    setReadArticle(null);
    setApproveArticle(article);
  }

  async function handlePublish(categoria: string, topico: string) {
    if (!approveArticle) return;
    try {
      await api.moderate(approveArticle.id, {
        status: "approved",
        category_admin: categoria,
        topic: topico || undefined,
        moderated_by: getSession()?.userId,
      });
      setItems((prev) => prev.filter((a) => a.id !== approveArticle.id));
      setApproveArticle(null);
    } catch (err) {
      alert(
        `Falha ao re-aprovar: ${
          err instanceof Error ? err.message : "erro desconhecido"
        }`
      );
    }
  }

  return (
    <div>
      <h1 className="text-[42px] font-bold mb-8 text-black">
        Notícias Reprovadas
      </h1>

      {loading && <p className="text-[#666]">Carregando...</p>}

      {error && (
        <div className="bg-[#FDECEA] border border-[#F5C6C0] text-[#B71C1C] rounded-lg p-4 mb-6">
          <p className="font-bold mb-1">Erro ao buscar notícias reprovadas.</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-[#666]">Nenhuma notícia reprovada ainda.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((news) => (
          <button
            key={news.id}
            type="button"
            onClick={() => setReadArticle(news)}
            className="text-left bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col"
            style={{ boxShadow: "0 4px 4px 0 rgba(0,0,0,0.15)" }}
          >
            <div className="w-full h-40 bg-gray-200 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={news.image || "/images/mocks/mock1.png"}
                alt={news.title || ""}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/mocks/mock1.png";
                }}
              />
            </div>
            <div className="px-5 py-4 flex flex-col grow">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#DD2424] mb-1">
                Reprovada
              </span>
              <h3 className="text-black text-base font-bold line-clamp-3 mb-2">
                {news.title || "Sem título"}
              </h3>
              <p className="text-[#666] text-xs line-clamp-2 mt-auto">
                {news.source_name || "Fonte desconhecida"}
              </p>
            </div>
          </button>
        ))}
      </div>

      <ReaderModal
        open={readArticle !== null}
        article={readArticle}
        onClose={() => setReadArticle(null)}
        onApprove={openApprove}
        approveLabel="Aprovar mesmo assim"
      />

      <ApprovalModal
        open={approveArticle !== null}
        articleTitle={approveArticle?.title || ""}
        onClose={() => setApproveArticle(null)}
        onPublish={handlePublish}
      />
    </div>
  );
};

export default NoticiasReprovadasContent;

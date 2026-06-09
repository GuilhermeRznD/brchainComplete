"use client";
import { useCallback, useEffect, useState } from "react";
import NewsListItem from "@/components/ui/NewsListItem";
import { api, Article } from "@/services/api";

const ARROW_ICON_PATH = "/icons/arrow-right.svg";

const NoticiasAprovadasContent: React.FC = () => {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listApproved(100);
      setItems(data.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Falha ao carregar aprovadas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="text-[42px] font-bold mb-10 text-black">
        Notícias Aprovadas
      </h1>

      {loading && <p className="text-[#666]">Carregando...</p>}

      {error && (
        <div className="bg-[#FDECEA] border border-[#F5C6C0] text-[#B71C1C] rounded-lg p-4 mb-6">
          <p className="font-bold mb-1">Erro ao buscar notícias aprovadas.</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-[#666]">Nenhuma notícia aprovada ainda.</p>
      )}

      <div>
        {items.map((news) => (
          <NewsListItem
            key={news.id}
            title={news.title || "Sem título"}
            statusColor={"#20C745"}
            arrowIconPath={ARROW_ICON_PATH}
          />
        ))}
      </div>
    </div>
  );
};

export default NoticiasAprovadasContent;

"use client";
import type { Article } from "@/services/api";

interface Props {
  open: boolean;
  article: Article | null;
  onClose: () => void;
  onApprove?: (article: Article) => void;
  onReject?: (article: Article) => void;
  approveLabel?: string;
  rejectLabel?: string;
}

const ReaderModal: React.FC<Props> = ({
  open,
  article,
  onClose,
  onApprove,
  onReject,
  approveLabel = "Aprovar",
  rejectLabel = "Reprovar",
}) => {
  if (!open || !article) return null;

  const title = article.title || "Sem título";
  const body = article.content || article.description || "Conteúdo não disponível.";
  const sourceUrl = article.url;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-8 pt-8 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black mb-2">{title}</h2>
          <p className="text-xs text-[#888]">
            {article.source_name || "Fonte desconhecida"}
            {article.published_at
              ? ` • ${new Date(article.published_at).toLocaleDateString("pt-BR")}`
              : ""}
          </p>
        </div>

        <div className="px-8 py-6 overflow-y-auto grow">
          {article.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt={title}
              className="w-full h-56 object-cover rounded-lg mb-5"
            />
          )}
          <p className="text-[#333] text-base leading-7 whitespace-pre-line">{body}</p>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-5 text-[#0D3F33] text-sm font-medium hover:underline"
            >
              Abrir matéria original →
            </a>
          )}
        </div>

        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-black hover:bg-gray-100 transition cursor-pointer"
          >
            Fechar
          </button>
          {onReject && (
            <button
              type="button"
              onClick={() => onReject(article)}
              className="px-5 py-2.5 rounded-lg bg-[#DD2424] hover:bg-opacity-90 text-white font-bold transition cursor-pointer"
            >
              {rejectLabel}
            </button>
          )}
          {onApprove && (
            <button
              type="button"
              onClick={() => onApprove(article)}
              className="px-5 py-2.5 rounded-lg bg-[#13930D] hover:bg-opacity-90 text-white font-bold transition cursor-pointer"
            >
              {approveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReaderModal;

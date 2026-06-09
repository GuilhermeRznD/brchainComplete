import type { Article } from "@/services/api";

interface Props {
  article: Article;
  onApprove: (article: Article) => void;
  onReject: (article: Article) => void;
  isBusy?: boolean;
}

const placeholder = "/images/mocks/mock1.png";

const ModerationCard: React.FC<Props> = ({
  article,
  onApprove,
  onReject,
  isBusy,
}) => {
  const title = article.title || "Sem titulo";
  const description = article.description || "Sem descricao disponivel.";
  const imageUrl = article.image || placeholder;
  const sourceLink = article.url || "#";

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col"
      style={{
        width: "340px",
        minHeight: "470px",
        boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="relative overflow-hidden w-full h-[180px] bg-gray-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholder;
          }}
        />
      </div>

      <div className="px-5 pt-3.5 pb-5 flex flex-col grow">
        <h3 className="text-black text-lg font-bold mb-1 line-clamp-2">
          {title}
        </h3>

        <p
          className="text-black text-sm font-normal mb-2 line-clamp-3"
          style={{ opacity: 0.8 }}
        >
          {description}
        </p>

        {sourceLink !== "#" && (
          <a
            href={sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-xs hover:underline truncate"
          >
            {article.source_name || sourceLink}
          </a>
        )}

        <div className="mt-auto pt-4 flex gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onApprove(article)}
            className="flex-1 bg-[#13930D] hover:bg-opacity-90 text-white text-sm font-bold rounded-lg py-2.5 transition cursor-pointer disabled:opacity-50"
          >
            Aprovar
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onReject(article)}
            className="flex-1 bg-[#DD2424] hover:bg-opacity-90 text-white text-sm font-bold rounded-lg py-2.5 transition cursor-pointer disabled:opacity-50"
          >
            Reprovar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationCard;

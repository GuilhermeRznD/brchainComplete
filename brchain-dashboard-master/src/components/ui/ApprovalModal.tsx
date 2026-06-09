"use client";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  articleTitle: string;
  onClose: () => void;
  onPublish: (categoria: string, topico: string) => Promise<void> | void;
}

// Categorias fixas — devem casar 1:1 com os chips do mobile (TelaFeedNoticias).
const CATEGORIAS = ["Notícias", "Dicas de Saúde"];

// 5 topicos fixos que cobrem as duas categorias.
const TOPICOS = [
  "Nutrição",
  "Exercícios",
  "Saúde Mental",
  "Prevenção",
  "Bem-estar",
];

const ApprovalModal: React.FC<Props> = ({
  open,
  articleTitle,
  onClose,
  onPublish,
}) => {
  const [categoria, setCategoria] = useState("");
  const [topico, setTopico] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCategoria("");
    setTopico("");
  }, [open]);

  if (!open) return null;

  async function handlePublish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!categoria) {
      setError("Selecione uma categoria antes de publicar.");
      return;
    }
    setError(null);
    setPublishing(true);
    try {
      await onPublish(categoria, topico);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao publicar.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-modal-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !publishing) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <h2
          id="approval-modal-title"
          className="text-2xl font-bold text-black mb-2"
        >
          Aprovar e publicar notícia
        </h2>
        <p className="text-sm text-[#666] mb-6 line-clamp-2">{articleTitle}</p>

        <form onSubmit={handlePublish} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm text-black">
            <span className="mb-1 font-medium">Categoria</span>
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setTopico("");
              }}
              required
              disabled={publishing}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D3F33]"
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORIAS.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm text-black">
            <span className="mb-1 font-medium">Tópico / Tag</span>
            <select
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
              disabled={publishing}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0D3F33]"
            >
              <option value="">Selecione um tópico (opcional)</option>
              {TOPICOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <div
              role="alert"
              className="text-sm text-[#B71C1C] bg-[#FDECEA] border border-[#F5C6C0] rounded-lg px-3 py-2"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={publishing}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-black hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={publishing}
              className="px-6 py-2.5 rounded-lg bg-[#13930D] hover:bg-opacity-90 text-white font-bold transition cursor-pointer disabled:opacity-50"
            >
              {publishing ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalModal;

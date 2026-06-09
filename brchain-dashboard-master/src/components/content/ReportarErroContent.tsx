import { useState } from "react";
import Image from "next/image";

const ERROR_TYPES = [
  "Notícia Duplicada",
  "Fonte Incorreta",
  "Texto Incompleto",
  "Data Incorreta",
  "Outro",
];
const ARROW_DOWN_PATH = "/icons/arrow-down-black.svg";
const CLIP_ICON_PATH = "/icons/clip.svg";

const primaryBg = "bg-[#0D3F33]";
const primaryTextColor = "text-[#0D3F33]";
const inputWidth = "820px";

const ReportarErroContent: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedErrorType, setSelectedErrorType] = useState(
    "Selecione uma opção"
  );
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    alert(
      `Erro Enviado:\nTipo: ${selectedErrorType}\nDescrição: ${description}`
    );
  };

  return (
    <div>
      <h1 className="text-[42px] font-bold mb-4 text-black">Reportar Erro</h1>

      <p
        className="text-black text-[24px] font-medium mb-10"
        style={{ opacity: 0.8 }}
      >
        Use este formulário para reportar problemas relacionados às notícias
        capturadas automaticamente. Isso nos ajuda a manter a qualidade do
        conteúdo exibido no app.
      </p>

      <div className="flex flex-col items-center">
        <div style={{ width: inputWidth }} className="mb-[26px]">
          <label className="text-black text-[26px] font-bold block mb-[18px]">
            Tipo de Erro:
          </label>

          <div className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white border-2 border-black rounded-2xl flex items-center justify-between cursor-pointer pr-4"
              style={{ width: "100%", height: "70px" }}
            >
              <span className="text-black text-[24px] font-medium pl-6">
                {selectedErrorType}
              </span>

              <Image
                src={ARROW_DOWN_PATH}
                alt="Abrir opções"
                width={24}
                height={24}
                className={`transition-transform duration-300 ${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>

            {isDropdownOpen && (
              <div
                className="absolute left-0 right-0 mt-1 bg-white shadow-xl z-10 border-2 border-t-0 border-black overflow-hidden"
                style={{ borderRadius: "0 0 16px 16px" }}
              >
                {ERROR_TYPES.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setSelectedErrorType(option);
                      setIsDropdownOpen(false);
                    }}
                    className="py-4 px-6 text-black text-[24px] font-medium hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ width: inputWidth }} className="mb-8">
          <label className="text-black text-[26px] font-bold block mb-[18px]">
            Descrição do Erro:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escreva uma breve descrição do erro..."
            className={`w-full border-2 border-black rounded-2xl p-6 resize-none`}
            style={{
              height: "232px",
              fontSize: "24px",
              fontWeight: 500,
              color: "rgba(51, 51, 51, 0.80)",
            }}
          />
        </div>

        <div
          style={{ width: inputWidth }}
          className="flex justify-between space-x-4"
        >
          <button
            onClick={() => alert("Simulação: Abrir diálogo de anexo de imagem")}
            className={`flex items-center ${primaryBg} text-white text-[20px] font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer`}
            style={{ padding: "12px 15px" }}
          >
            <Image
              src={CLIP_ICON_PATH}
              alt="Ícone de anexo"
              width={24}
              height={24}
              className="w-6 h-6 mr-3.5"
            />
            Anexar imagem
          </button>

          <button
            onClick={handleSubmit}
            className={`flex items-center ${primaryBg} text-white text-[20px] font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer `}
            style={{ padding: "12px 15px" }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportarErroContent;

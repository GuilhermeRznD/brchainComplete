"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { getSession, setSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se ja houver sessao admin, pula direto para o painel
  useEffect(() => {
    const session = getSession();
    if (session && session.userRole === "admin") {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.login(email, senha);
      if (data.userRole !== "admin") {
        setError(
          "Esta conta nao tem permissao de administrador. Use uma conta admin para acessar o painel."
        );
        return;
      }
      setSession(data);
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha na conexao com a API.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F6]">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/brchainlogo.png"
            alt="BRChain"
            width={260}
            height={70}
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-black mb-2 text-center">
          Painel Administrativo
        </h1>
        <p className="text-sm text-[#666] mb-6 text-center">
          Acesso restrito a moderadores da plataforma.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm text-black">
            <span className="mb-1 font-medium">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0D3F33]"
              placeholder="admin@brchain.com"
            />
          </label>

          <label className="flex flex-col text-sm text-black">
            <span className="mb-1 font-medium">Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0D3F33]"
            />
          </label>

          {error && (
            <div
              role="alert"
              className="text-sm text-[#B71C1C] bg-[#FDECEA] border border-[#F5C6C0] rounded-lg px-3 py-2"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#0D3F33] hover:bg-opacity-90 text-white text-base font-bold rounded-lg py-3 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-xs text-[#888] mt-6 text-center">
          Dica de dev: qualquer e-mail contendo &quot;admin&quot; ou no dominio
          @brchain.com loga como administrador.
        </p>
      </div>
    </div>
  );
}

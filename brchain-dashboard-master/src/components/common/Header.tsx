"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import NotificationBell from "../ui/NotificationBell";
import { AdminSession, getSession } from "@/lib/session";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Notícia Adicionada",
    description: "Uma nova notícia está disponível para análise!",
    time: "2 horas",
  },
  {
    id: 2,
    title: "Aprovação Removida",
    description:
      "Uma aprovação foi desfeita e a notícia voltou para a lista de notícias pendentes.",
    time: "1 dia",
  },
];

function initialsFor(name?: string | null) {
  if (!name) return "MA";
  return name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

const Header = () => {
  const [session, setSessionState] = useState<AdminSession | null>(null);

  useEffect(() => {
    setSessionState(getSession());
  }, []);

  return (
    <header className="flex py-6 px-22 justify-between border-b border-black/20">
      <Link href="/">
        <Image
          src="/images/brchainlogo.png"
          alt="Logo da BRChain"
          width={315}
          height={90}
          priority
        />
      </Link>

      <div className="flex items-center gap-8.5">
        <NotificationBell notifications={MOCK_NOTIFICATIONS} />

        <div
          className="w-15.5 h-15.5 rounded-full bg-[#7B1FA2] flex justify-center items-center text-white text-2xl font-medium pointer-events-none select-none"
          title={session?.userName || ""}
        >
          {initialsFor(session?.userName)}
        </div>
      </div>
    </header>
  );
};

export default Header;

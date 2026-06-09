"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/session";

// Bloqueia toda a area protegida ate confirmar que existe sessao admin.
// Roda apenas no client (sessionStorage nao existe no SSR).

interface Props {
  children: React.ReactNode;
}

const AdminGuard: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || session.userRole !== "admin") {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7F6] text-[#666]">
        Verificando sessao...
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;

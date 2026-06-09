"use client";
import React, { useState } from "react";
import Header from "@/components/common/Header";
import Sidebar from "@/components/common/Sidebar";

import PainelGeralContent from "@/components/content/PainelGeralContent";
import NoticiasAprovadasContent from "@/components/content/NoticiasAprovadasContent";
import NoticiasReprovadasContent from "@/components/content/NoticiasReprovadasContent";
import ReportarErroContent from "@/components/content/ReportarErroContent";

const CONTENT_MAP: { [key: string]: React.FC } = {
  PAINEL_GERAL: PainelGeralContent,
  NOTICIAS_APROVADAS: NoticiasAprovadasContent,
  NOTICIAS_REPROVADAS: NoticiasReprovadasContent,
  REPORTAR_ERRO: ReportarErroContent,
};

const DashboardLayout: React.FC = () => {
  const [activeContentKey, setActiveContentKey] =
    useState<string>("PAINEL_GERAL");
  const ActiveContentComponent =
    CONTENT_MAP[activeContentKey] || (() => <div>Conteúdo não encontrado</div>);

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex grow overflow-hidden">
        <Sidebar
          onSelectContent={setActiveContentKey}
          activeKey={activeContentKey}
        />

        <div className="flex flex-col grow overflow-y-auto">
          <main className="p-6 grow">
            <ActiveContentComponent />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/session";

interface SubNavItem {
  id: string;
  label: string;
  contentKey: string;
}

interface NavItem {
  id: string;
  label: string;
  iconPath: string;
  contentKey: string;
  subItems?: SubNavItem[];
}

interface SidebarProps {
  onSelectContent: (contentKey: string) => void;
  activeKey: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "painel-geral",
    label: "Painel Geral",
    iconPath: "/icons/dashboard-icon.svg",
    contentKey: "PAINEL_GERAL",
  },
  {
    id: "gerenciar-noticias",
    label: "Gerenciar Notícias",
    iconPath: "/icons/manage-icon.svg",
    contentKey: "GERENCIAR_NOTICIAS",
    subItems: [
      {
        id: "aprovadas",
        label: "Notícias Aprovadas",
        contentKey: "NOTICIAS_APROVADAS",
      },
      {
        id: "reprovadas",
        label: "Notícias Reprovadas",
        contentKey: "NOTICIAS_REPROVADAS",
      },
    ],
  },
  {
    id: "reportar-erro",
    label: "Reportar Erro",
    iconPath: "/icons/error-icon.svg",
    contentKey: "REPORTAR_ERRO",
  },
];

const LOGOUT_ICON_PATH = "/icons/logout.svg";
const ARROW_DOWN_PATH = "/icons/arrow-down.svg";
const ARROW_UP_PATH = "/icons/arrow-up.svg";

const sidebarBg = "bg-[#0D3F33]";
const logoutBg = "bg-[#388834]";

const iconStyle = "w-5 h-5 mr-3";
const mainItemSpacing = "mb-4";
const subItemSpacing = "mb-3";
const hoverTextColor = "hover:text-[#388834]";
const activeItemStyle = "text-[#388834]";

const Sidebar: React.FC<SidebarProps> = ({ onSelectContent, activeKey }) => {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(
    "gerenciar-noticias"
  );

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  const handleToggle = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleItemClick = (
    key: string,
    itemId: string,
    hasSubItems: boolean
  ) => {
    if (!hasSubItems) {
      onSelectContent(key);
    }
    if (hasSubItems) {
      handleToggle(itemId);
    }
  };

  return (
    <aside
      className={`h-full ${sidebarBg} text-white flex flex-col justify-between shrink-0`}
      style={{ width: "280px" }}
    >
      <nav className="grow">
        <ul className="pt-9 px-6 list-none p-0">
          {NAV_ITEMS.map((item) => {
            const isActive =
              activeKey === item.contentKey ||
              item.subItems?.some((sub) => sub.contentKey === activeKey);
            const baseClass = `flex items-center text-sm font-medium cursor-pointer transition-colors duration-200`;

            return (
              <li key={item.id} className={mainItemSpacing}>
                <div
                  className={`${baseClass} ${
                    isActive ? activeItemStyle : "text-white"
                  } ${hoverTextColor}`}
                  onClick={() =>
                    handleItemClick(item.contentKey, item.id, !!item.subItems)
                  }
                >
                  <Image
                    src={item.iconPath}
                    alt={`${item.label} Icon`}
                    width={20}
                    height={20}
                    className={`${iconStyle}`}
                  />

                  <span className="grow text-base font-semibold">
                    {item.label}
                  </span>

                  {item.subItems && (
                    <Image
                      src={
                        openDropdown === item.id
                          ? ARROW_UP_PATH
                          : ARROW_DOWN_PATH
                      }
                      alt="Seta"
                      width={16}
                      height={16}
                      className={`w-5 h-5 ml-2`}
                    />
                  )}
                </div>

                {item.subItems && openDropdown === item.id && (
                  <ul className="list-none p-0 mt-3 pl-8">
                    {item.subItems.map((subItem) => {
                      const isSubActive = activeKey === subItem.contentKey;
                      return (
                        <li key={subItem.id} className={subItemSpacing}>
                          <div
                            onClick={() => onSelectContent(subItem.contentKey)}
                            className={`block text-sm cursor-pointer transition-colors duration-200 ${
                              isSubActive ? activeItemStyle : "text-white"
                            } ${hoverTextColor}`}
                          >
                            {subItem.label}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 pb-6">
        <button
          onClick={handleLogout}
          className={`w-full h-12 ${logoutBg} hover:bg-opacity-90 transition duration-150 text-white text-xl font-bold rounded-xl flex items-center justify-center cursor-pointer`}
          style={{ width: "230px", height: "48px" }}
        >
          <Image
            src={LOGOUT_ICON_PATH}
            alt="Sair"
            width={20}
            height={20}
            className="w-8 h-8 mr-2"
          />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

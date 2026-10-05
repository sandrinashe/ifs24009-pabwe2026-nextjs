"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconArticle,
  IconUserHeart,
  IconUsers,
  IconUserCircle,
  IconChevronRight,
} from "@tabler/icons-react";

function SidebarComponent({ isSidebarOpen, onCloseMobile }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMeTab = searchParams.get("tab") === "me";

  const navItems = [
    {
      href: "/",
      label: "Semua Postingan",
      icon: IconArticle,
      isActive: pathname === "/" && !isMeTab,
    },
    {
      href: "/?tab=me",
      label: "Postingan Saya",
      icon: IconUserHeart,
      isActive: pathname === "/" && isMeTab,
    },
    {
      href: "/users",
      label: "Daftar Pengguna",
      icon: IconUsers,
      isActive: pathname === "/users" || pathname.startsWith("/users/"),
    },
    {
      href: "/profile",
      label: "Profil Saya",
      icon: IconUserCircle,
      isActive: pathname === "/profile" || pathname.startsWith("/profile/"),
    },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          data-testid="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Menu Utama
              </p>
              <nav className="mt-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.isActive;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={20}
                          className={
                            isActive
                              ? "text-white"
                              : "text-slate-500 group-hover:text-slate-600"
                          }
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <IconChevronRight size={16} />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100/60">
            <p className="text-xs font-semibold text-indigo-900">
              Bagikan ceritamu hari ini
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SidebarComponent;

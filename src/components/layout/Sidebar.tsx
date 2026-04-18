"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ModuleColor } from "@/lib/types";

type Item = { href: string; code: string; label: string };
type Section = { color: ModuleColor; title: string; items: Item[] };

const sections: Section[] = [
  {
    color: "ops",
    title: "Operaciones",
    items: [
      { href: "/", code: "Op 01", label: "Home — Hoy" },
      { href: "/clientes", code: "Op 02", label: "Clientes" },
      { href: "/tareas", code: "Op 05", label: "Mis tareas" },
    ],
  },
  {
    color: "fin",
    title: "Finanzas",
    items: [
      { href: "/tesoreria", code: "Fin 01", label: "Tesorería" },
      { href: "/cobros", code: "Fin 02", label: "Agenda de cobros" },
      { href: "/insumos", code: "Fin 03", label: "Insumos" },
      { href: "/rentabilidad", code: "Fin 04", label: "Rentabilidad" },
      { href: "/audit", code: "Fin 05", label: "Audit log" },
    ],
  },
  {
    color: "grow",
    title: "Crecimiento",
    items: [
      { href: "/prospectos", code: "Crec 01", label: "Prospectos" },
      { href: "/tarifario", code: "Crec 02", label: "Tarifario" },
      { href: "/configuracion", code: "Crec 03", label: "Configuración" },
      { href: "/logros", code: "Crec 04", label: "Muro de logros" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sidebar-dark h-screen sticky top-0 overflow-y-auto flex flex-col"
      style={{
        background: "var(--color-burgundy)",
        color: "#F2ECDF",
        borderRight: "1px solid rgba(242,236,223,0.08)",
      }}
    >
      <div
        className="px-6 pt-6 pb-5"
        style={{ borderBottom: "1px solid rgba(242,236,223,0.1)" }}
      >
        <Link href="/" className="block">
          <div className="display text-[1.4rem] leading-none tracking-[0.06em]">
            PANEL · RAMIRO
          </div>
          <div
            className="serif text-[12px] mt-1"
            style={{ color: "rgba(242,236,223,0.55)" }}
          >
            gestión interna
          </div>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-6 px-3 py-5">
        {sections.map((section) => (
          <div key={section.title}>
            <div
              className="mono text-[9px] uppercase tracking-[0.2em] px-3 mb-2"
              style={{ color: "rgba(242,236,223,0.5)" }}
            >
              {section.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group block px-3 py-2 rounded-[6px] transition-colors"
                    style={{
                      background: active
                        ? "rgba(242,236,223,0.11)"
                        : "transparent",
                    }}
                  >
                    <div
                      className="mono text-[9px] uppercase tracking-[0.16em]"
                      style={{
                        color: active
                          ? "#F2ECDF"
                          : "rgba(242,236,223,0.45)",
                      }}
                    >
                      {item.code}
                    </div>
                    <div
                      className="text-[13px] mt-0.5"
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        color: active ? "#F2ECDF" : "rgba(242,236,223,0.82)",
                      }}
                    >
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className="px-6 py-5"
        style={{ borderTop: "1px solid rgba(242,236,223,0.1)" }}
      >
        <div
          className="serif italic text-[12px]"
          style={{ color: "rgba(242,236,223,0.6)" }}
        >
          Bariloche · 2026
        </div>
      </div>
    </aside>
  );
}

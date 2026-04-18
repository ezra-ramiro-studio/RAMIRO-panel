"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ModuleColor } from "@/lib/types";

type Item = { href: string; label: string };
type Section = { key: string; color: ModuleColor; title: string; items: Item[] };

const sections: Section[] = [
  {
    key: "ops",
    color: "ops",
    title: "Operaciones",
    items: [
      { href: "/clientes", label: "Clientes" },
      { href: "/proyectos", label: "Proyectos" },
      { href: "/tareas", label: "Mis tareas" },
    ],
  },
  {
    key: "fin",
    color: "fin",
    title: "Finanzas",
    items: [
      { href: "/tesoreria", label: "Tesorería" },
      { href: "/cobros", label: "Agenda de cobros" },
      { href: "/insumos", label: "Insumos" },
      { href: "/rentabilidad", label: "Rentabilidad" },
      { href: "/audit", label: "Audit log" },
    ],
  },
  {
    key: "grow",
    color: "grow",
    title: "Crecimiento",
    items: [
      { href: "/prospectos", label: "Prospectos" },
      { href: "/tarifario", label: "Tarifario" },
      { href: "/configuracion", label: "Configuración" },
      { href: "/logros", label: "Muro de logros" },
    ],
  },
];

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of sections) {
      initial[section.key] = section.items.some((item) =>
        isItemActive(pathname, item.href),
      );
    }
    return initial;
  });

  const toggle = (key: string) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

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

      <nav className="flex-1 flex flex-col gap-2 px-3 py-5">
        <Link
          href="/"
          className="block px-3 py-2 rounded-[6px] transition-colors mb-1"
          style={{
            background:
              pathname === "/" ? "rgba(242,236,223,0.11)" : "transparent",
          }}
        >
          <div
            className="text-[15px]"
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color:
                pathname === "/" ? "#F2ECDF" : "rgba(242,236,223,0.78)",
            }}
          >
            Home — Hoy
          </div>
        </Link>

        {sections.map((section) => {
          const expanded = open[section.key];
          const sectionActive = section.items.some((item) =>
            isItemActive(pathname, item.href),
          );
          return (
            <div key={section.key}>
              <button
                type="button"
                onClick={() => toggle(section.key)}
                aria-expanded={expanded}
                aria-controls={`section-${section.key}`}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[6px] transition-colors"
                style={{
                  background: "transparent",
                  color:
                    sectionActive || expanded
                      ? "#F2ECDF"
                      : "rgba(242,236,223,0.78)",
                }}
              >
                <span
                  className="text-[15px]"
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  {section.title}
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  style={{
                    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 180ms ease",
                    opacity: 0.6,
                  }}
                >
                  <path
                    d="M3 1.5L6.5 5L3 8.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {expanded && (
                <div
                  id={`section-${section.key}`}
                  className="flex flex-col gap-0.5 mt-1 mb-2"
                >
                  {section.items.map((item) => {
                    const active = isItemActive(pathname, item.href);
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
                          className="text-[13px]"
                          style={{
                            fontFamily: "var(--font-syne)",
                            fontWeight: 500,
                            letterSpacing: "0.02em",
                            color: active
                              ? "#F2ECDF"
                              : "rgba(242,236,223,0.7)",
                          }}
                        >
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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

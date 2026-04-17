"use client";

import { useEffect, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  widthClass?: string;
}

export function Dialog({ open, onClose, title, description, children, widthClass = "max-w-[540px]" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(33,25,20,0.55)" }}
      onClick={onClose}
    >
      <div
        className={`w-full ${widthClass} rounded-[10px] border overflow-hidden max-h-[90vh] flex flex-col`}
        style={{
          background: "var(--color-paper)",
          borderColor: "var(--color-border-2)",
          boxShadow: "0 20px 60px rgba(33,25,20,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: "var(--color-border-1)" }}
        >
          <div
            className="mono text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "var(--color-burgundy)" }}
          >
            {title}
          </div>
          {description ? (
            <div
              className="serif italic text-[13px] mt-1"
              style={{ color: "var(--color-muted)" }}
            >
              {description}
            </div>
          ) : null}
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

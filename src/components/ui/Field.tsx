import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const inputBase =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-[6px] px-3 py-2 text-[13px] outline-none focus:border-[var(--color-burgundy)] placeholder:text-[var(--color-muted)]";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mono text-[10px] uppercase tracking-[0.16em] block mb-1.5"
      style={{ color: "var(--color-muted)" }}
    >
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} min-h-[80px] ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1.5 mb-4">{children}</div>;
}

export function FormGrid({ children, cols = 2 }: { children: ReactNode; cols?: 1 | 2 | 3 }) {
  const g = cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-3" : "grid-cols-2";
  return <div className={`grid gap-3 ${g} mb-4`}>{children}</div>;
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[var(--color-border-1)]">{children}</div>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <div
      className="text-[12px] px-3 py-2 rounded-[6px] mt-3"
      style={{
        background: "rgba(166,53,44,0.08)",
        color: "#A6352C",
        border: "1px solid rgba(166,53,44,0.25)",
      }}
    >
      {children}
    </div>
  );
}

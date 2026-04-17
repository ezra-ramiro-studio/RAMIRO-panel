import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "ops" | "fin" | "grow" | "neutral" | "primary" | "ghost" | "danger";

const toneBg: Record<Tone, string> = {
  ops: "rgba(107,31,43,0.08)",
  fin: "rgba(74,122,62,0.10)",
  grow: "rgba(196,122,62,0.12)",
  neutral: "transparent",
  primary: "#6B1F2B",
  ghost: "transparent",
  danger: "rgba(166,53,44,0.08)",
};
const toneBorder: Record<Tone, string> = {
  ops: "rgba(107,31,43,0.28)",
  fin: "rgba(74,122,62,0.32)",
  grow: "rgba(196,122,62,0.38)",
  neutral: "rgba(107,31,43,0.15)",
  primary: "#6B1F2B",
  ghost: "transparent",
  danger: "rgba(166,53,44,0.32)",
};
const toneColor: Record<Tone, string> = {
  ops: "#6B1F2B",
  fin: "#4A7A3E",
  grow: "#C47A3E",
  neutral: "#6B1F2B",
  primary: "#F2ECDF",
  ghost: "#7A6466",
  danger: "#A6352C",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  variant?: "solid" | "ghost";
  icon?: ReactNode;
}

export function Button({
  tone = "neutral",
  variant = "solid",
  icon,
  children,
  className = "",
  ...rest
}: Props) {
  const base =
    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-[11px] font-semibold uppercase tracking-[0.14em] transition-all whitespace-nowrap mono";
  const style =
    variant === "ghost"
      ? {
          background: "transparent",
          borderColor: "rgba(107,31,43,0.15)",
          color: "#7A6466",
        }
      : {
          background: toneBg[tone],
          borderColor: toneBorder[tone],
          color: toneColor[tone],
        };
  return (
    <button
      className={`${base} border hover:brightness-[0.97] active:brightness-[0.92] ${className}`}
      style={style}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

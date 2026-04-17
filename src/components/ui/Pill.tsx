import type { ReactNode } from "react";

type Tone =
  | "ops"
  | "fin"
  | "grow"
  | "gold"
  | "red"
  | "yellow"
  | "cyan"
  | "muted"
  | "green";

const toneStyles: Record<Tone, { bg: string; border: string; color: string }> = {
  ops:    { bg: "rgba(107,31,43,0.08)",  border: "rgba(107,31,43,0.28)",  color: "#6B1F2B" },
  fin:    { bg: "rgba(74,122,62,0.10)",  border: "rgba(74,122,62,0.32)",  color: "#4A7A3E" },
  green:  { bg: "rgba(74,122,62,0.10)",  border: "rgba(74,122,62,0.32)",  color: "#4A7A3E" },
  grow:   { bg: "rgba(196,122,62,0.12)", border: "rgba(196,122,62,0.38)", color: "#C47A3E" },
  gold:   { bg: "rgba(196,122,62,0.12)", border: "rgba(196,122,62,0.38)", color: "#C47A3E" },
  red:    { bg: "rgba(166,53,44,0.10)",  border: "rgba(166,53,44,0.32)",  color: "#A6352C" },
  yellow: { bg: "rgba(196,122,62,0.12)", border: "rgba(196,122,62,0.38)", color: "#C47A3E" },
  cyan:   { bg: "rgba(107,31,43,0.08)",  border: "rgba(107,31,43,0.28)",  color: "#6B1F2B" },
  muted:  { bg: "rgba(107,31,43,0.04)",  border: "rgba(107,31,43,0.12)",  color: "#7A6466" },
};

export function Pill({
  tone = "muted",
  children,
  className = "",
  mono = true,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  mono?: boolean;
}) {
  const s = toneStyles[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.14em] rounded-[3px] border ${mono ? "mono" : ""} ${className}`}
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
    >
      {children}
    </span>
  );
}

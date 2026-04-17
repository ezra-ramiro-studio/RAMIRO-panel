import type { ReactNode } from "react";

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "ops" | "fin" | "grow";
}) {
  const toneColor = {
    neutral: "var(--color-burgundy)",
    ops: "var(--color-ops)",
    fin: "var(--color-fin)",
    grow: "var(--color-grow)",
  }[tone];

  return (
    <div>
      <div className="mono text-[9px] tracking-[0.2em] uppercase text-[var(--color-muted)] mb-1.5">
        {label}
      </div>
      <div
        className="display text-[30px] leading-none tracking-[0.02em]"
        style={{ color: toneColor }}
      >
        {value}
      </div>
      {hint && (
        <div className="serif italic text-[12px] text-[var(--color-muted)] mt-2">
          {hint}
        </div>
      )}
    </div>
  );
}

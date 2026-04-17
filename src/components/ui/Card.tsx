import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = true,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-[10px] ${padding ? "p-6" : ""} ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  badge,
  kicker,
}: {
  children: ReactNode;
  badge?: ReactNode;
  kicker?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-[var(--color-border-1)]">
      <div className="flex items-baseline gap-2">
        <h3
          className="mono text-[11px] uppercase tracking-[0.2em]"
          style={{ color: "var(--color-burgundy)" }}
        >
          {children}
        </h3>
        {kicker && (
          <span className="serif italic text-[13px] text-[var(--color-muted)]">
            {kicker}
          </span>
        )}
      </div>
      {badge}
    </div>
  );
}

export function SectionTitle({
  children,
  kicker,
  italicTail,
}: {
  children: ReactNode;
  kicker?: string;
  italicTail?: string;
}) {
  return (
    <div className="mb-2">
      {kicker && (
        <div
          className="mono text-[10px] tracking-[0.2em] uppercase mb-3 flex items-center gap-3"
          style={{ color: "var(--color-muted)" }}
        >
          <span
            className="inline-block w-6 h-[1px]"
            style={{ background: "var(--color-burgundy)" }}
          />
          {kicker}
        </div>
      )}
      <h1 className="display text-[48px] leading-[0.95] tracking-[0.02em] text-[var(--color-text)]">
        {children}
        {italicTail && (
          <span
            className="serif italic ml-2"
            style={{ color: "var(--color-burgundy)", fontSize: "0.8em" }}
          >
            {italicTail}
          </span>
        )}
      </h1>
    </div>
  );
}

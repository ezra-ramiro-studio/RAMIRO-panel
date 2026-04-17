import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className="text-center py-10 px-4 rounded-[8px] border-dashed"
      style={{
        border: "1px dashed var(--color-border-2)",
        background: "var(--color-surface)",
      }}
    >
      {icon && (
        <div className="text-2xl mb-2" style={{ color: "var(--color-burgundy)" }}>
          {icon}
        </div>
      )}
      <div
        className="serif italic text-[15px]"
        style={{ color: "var(--color-text-soft)" }}
      >
        {title}
      </div>
      {description && (
        <div className="text-[12px] text-[var(--color-muted)] mt-1">
          {description}
        </div>
      )}
    </div>
  );
}

import { currentUser } from "@/lib/mock";

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-[7px] h-[7px] rounded-full"
      style={{ background: color }}
    />
  );
}

export function Header() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-8 h-16 backdrop-blur-xl"
      style={{
        background: "rgba(242,236,223,0.88)",
        borderBottom: "1px solid var(--color-border-2)",
      }}
    >
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-[11px] mono uppercase tracking-[0.16em] text-[var(--color-muted)]">
            <Dot color="var(--color-ops)" /> Operaciones
          </div>
          <div className="flex items-center gap-1.5 text-[11px] mono uppercase tracking-[0.16em] text-[var(--color-muted)]">
            <Dot color="var(--color-fin)" /> Finanzas
          </div>
          <div className="flex items-center gap-1.5 text-[11px] mono uppercase tracking-[0.16em] text-[var(--color-muted)]">
            <Dot color="var(--color-grow)" /> Crecimiento
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="serif italic text-[12px] text-[var(--color-muted)] hidden md:block">
          {currentUser.email}
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-2)",
            color: "var(--color-burgundy)",
          }}
          title={currentUser.name}
        >
          {currentUser.avatar_emoji ?? currentUser.name[0]}
        </div>
      </div>
    </header>
  );
}

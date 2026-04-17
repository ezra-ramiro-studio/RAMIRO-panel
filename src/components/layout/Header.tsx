import Link from "next/link";
import { fetchCurrentUser } from "@/lib/queries";

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-[7px] h-[7px] rounded-full"
      style={{ background: color }}
    />
  );
}

export async function Header() {
  const user = await fetchCurrentUser();
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
        {user && (
          <div className="serif italic text-[12px] text-[var(--color-muted)] hidden md:block">
            {user.email}
          </div>
        )}
        {user && (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-2)",
              color: "var(--color-burgundy)",
            }}
            title={user.name}
          >
            {user.avatar_emoji ?? user.name[0]}
          </div>
        )}
        <Link
          href="/auth/signout"
          className="mono text-[10px] uppercase tracking-[0.14em] px-3 py-2 rounded-[6px] border hover:bg-[var(--color-surface)] transition-colors"
          style={{
            borderColor: "var(--color-border-2)",
            color: "var(--color-muted)",
          }}
        >
          Salir
        </Link>
      </div>
    </header>
  );
}

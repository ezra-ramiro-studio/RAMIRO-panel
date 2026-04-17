import { Card, CardTitle, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { treasuryByAccount, treasuryTotals } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";

export default function TesoreriaPage() {
  const byAccount = treasuryByAccount();
  const totals = treasuryTotals();

  const ars = byAccount.filter((a) => a.currency === "ARS");
  const usd = byAccount.filter((a) => a.currency === "USD");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Fin 01">Tesorería</SectionTitle>
        <div className="flex gap-2">
          <select className="bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-[7px] px-3 py-1.5 text-[0.8rem] outline-none">
            <option>Mes actual — Abril 2026</option>
            <option>Trimestre</option>
            <option>Año</option>
            <option>Personalizado…</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="relative overflow-hidden">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl"
            style={{ background: "rgba(74,122,62,0.12)" }}
          />
          <div className="mono text-[0.62rem] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-2">
            Total negocio ARS
          </div>
          <div className="display text-4xl font-extrabold" style={{ color: "#4A7A3E" }}>
            {formatCurrency(totals.ars, "ARS")}
          </div>
          <div className="text-[0.72rem] text-[var(--color-muted)] mt-2">
            Suma neta de todas las cuentas en pesos.
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl"
            style={{ background: "rgba(74,122,62,0.12)" }}
          />
          <div className="mono text-[0.62rem] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-2">
            Total negocio USD
          </div>
          <div className="display text-4xl font-extrabold" style={{ color: "#4A7A3E" }}>
            {formatCurrency(totals.usd, "USD")}
          </div>
          <div className="text-[0.72rem] text-[var(--color-muted)] mt-2">
            Suma neta de todas las cuentas en dólares.
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="display text-lg font-semibold">Cuentas ARS</h2>
          <Pill tone="muted">{ars.length}</Pill>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ars.map((a) => (
            <AccountCard key={a.account_id} a={a} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="display text-lg font-semibold">Cuentas USD</h2>
          <Pill tone="muted">{usd.length}</Pill>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usd.map((a) => (
            <AccountCard key={a.account_id} a={a} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountCard({ a }: { a: ReturnType<typeof treasuryByAccount>[number] }) {
  return (
    <Card>
      <CardTitle badge={<Pill tone="muted">{a.owner}</Pill>}>{a.name}</CardTitle>
      <Stat label={`Balance ${a.currency}`} tone="fin" value={formatCurrency(a.balance, a.currency)} />
      <div className="mt-4 pt-4 border-t border-[var(--color-border-1)] grid grid-cols-2 gap-3 text-[0.75rem]">
        <div>
          <div className="mono text-[0.58rem] uppercase tracking-wider text-[var(--color-muted)]">
            Proyectos
          </div>
          <div className="mono mt-0.5">{formatCurrency(a.income_projects, a.currency)}</div>
        </div>
        <div>
          <div className="mono text-[0.58rem] uppercase tracking-wider text-[var(--color-muted)]">
            Mantenimiento
          </div>
          <div className="mono mt-0.5">{formatCurrency(a.income_maintenances, a.currency)}</div>
        </div>
      </div>
    </Card>
  );
}

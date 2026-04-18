import Link from "next/link";
import { Card, CardTitle, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { AccountDialog } from "@/components/dialogs/AccountDialog";
import { DeleteButton } from "@/components/actions/DeleteButton";
import { deleteAccountAction } from "@/lib/actions/accounts";
import {
  fetchAccounts,
  fetchUsers,
  treasuryByAccount,
  treasuryByAccountForPeriod,
  treasuryTotals,
  type TreasuryAccount,
} from "@/lib/queries";
import type { Account, User } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

type Period = "mes" | "trimestre" | "ano" | "todo";

type SearchParams = Promise<{ period?: string }>;

function periodRange(period: Period): { from?: string; to?: string; label: string } {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (period === "todo") return { label: "Histórico completo" };
  if (period === "ano") {
    const from = new Date(today.getFullYear(), 0, 1);
    return { from: iso(from), to: iso(today), label: `Año ${today.getFullYear()}` };
  }
  if (period === "trimestre") {
    const from = new Date(today);
    from.setMonth(today.getMonth() - 2);
    from.setDate(1);
    return { from: iso(from), to: iso(today), label: "Últimos 3 meses" };
  }
  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLabels = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return {
    from: iso(from),
    to: iso(today),
    label: `${monthLabels[today.getMonth()]} ${today.getFullYear()}`,
  };
}

export default async function TesoreriaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { period: periodParam = "todo" } = await searchParams;
  const period = (["mes", "trimestre", "ano", "todo"].includes(periodParam)
    ? periodParam
    : "todo") as Period;
  const range = periodRange(period);

  const [byAccount, totals, accounts, users] = await Promise.all([
    period === "todo"
      ? treasuryByAccount()
      : treasuryByAccountForPeriod(range.from, range.to),
    treasuryTotals(),
    fetchAccounts(),
    fetchUsers(),
  ]);

  const ars = byAccount.filter((a) => a.currency === "ARS");
  const usd = byAccount.filter((a) => a.currency === "USD");
  const accountById = new Map(accounts.map((a) => [a.id, a]));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionTitle kicker="Fin 01">Tesorería</SectionTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <form method="get" className="flex items-center gap-2">
            <select
              name="period"
              defaultValue={period}
              className="bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-[7px] px-3 py-1.5 text-[0.8rem] outline-none"
            >
              <option value="mes">Mes actual</option>
              <option value="trimestre">Últimos 3 meses</option>
              <option value="ano">Año en curso</option>
              <option value="todo">Histórico</option>
            </select>
            <Button type="submit" variant="ghost">Aplicar</Button>
          </form>
          <AccountDialog users={users} trigger={<Button tone="fin">+ Nueva cuenta</Button>} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="relative overflow-hidden">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl"
            style={{ background: "rgba(74,122,62,0.12)" }}
          />
          <div className="mono text-[0.62rem] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-2">
            Total negocio ARS · {range.label}
          </div>
          <div className="display text-4xl font-extrabold" style={{ color: "#4A7A3E" }}>
            {period === "todo"
              ? formatCurrency(totals.ars, "ARS")
              : formatCurrency(
                  ars.reduce((s, x) => s + x.balance, 0),
                  "ARS",
                )}
          </div>
          <div className="text-[0.72rem] text-[var(--color-muted)] mt-2">
            {period === "todo"
              ? "Suma neta de todas las cuentas en pesos."
              : "Flujo neto del período en pesos (ingresos − egresos)."}
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl"
            style={{ background: "rgba(74,122,62,0.12)" }}
          />
          <div className="mono text-[0.62rem] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-2">
            Total negocio USD · {range.label}
          </div>
          <div className="display text-4xl font-extrabold" style={{ color: "#4A7A3E" }}>
            {period === "todo"
              ? formatCurrency(totals.usd, "USD")
              : formatCurrency(
                  usd.reduce((s, x) => s + x.balance, 0),
                  "USD",
                )}
          </div>
          <div className="text-[0.72rem] text-[var(--color-muted)] mt-2">
            {period === "todo"
              ? "Suma neta de todas las cuentas en dólares."
              : "Flujo neto del período en dólares (ingresos − egresos)."}
          </div>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="display text-lg font-semibold">Cuentas ARS</h2>
          <Pill tone="muted">{ars.length}</Pill>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ars.map((a) => {
            const acc = accountById.get(a.account_id);
            return <AccountCard key={a.account_id} a={a} acc={acc} users={users} period={period} />;
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="display text-lg font-semibold">Cuentas USD</h2>
          <Pill tone="muted">{usd.length}</Pill>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usd.map((a) => {
            const acc = accountById.get(a.account_id);
            return <AccountCard key={a.account_id} a={a} acc={acc} users={users} period={period} />;
          })}
        </div>
      </div>
    </div>
  );
}

function AccountCard({
  a,
  acc,
  users,
  period,
}: {
  a: TreasuryAccount;
  acc: Account | undefined;
  users: User[];
  period: Period;
}) {
  return (
    <Card>
      <CardTitle badge={<Pill tone="muted">{a.owner}</Pill>}>{a.name}</CardTitle>
      <Stat
        label={period === "todo" ? `Balance ${a.currency}` : `Flujo neto ${a.currency}`}
        tone="fin"
        value={formatCurrency(a.balance, a.currency)}
      />
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
        <div>
          <div className="mono text-[0.58rem] uppercase tracking-wider text-[var(--color-muted)]">
            Egresos
          </div>
          <div className="mono mt-0.5" style={{ color: a.outflow > 0 ? "#A6352C" : undefined }}>
            {formatCurrency(a.outflow, a.currency)}
          </div>
        </div>
      </div>
      {acc && (
        <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[var(--color-border-1)]">
          <AccountDialog
            users={users}
            account={acc}
            trigger={<Button variant="ghost">Editar</Button>}
          />
          <DeleteButton
            onConfirm={async () => {
              "use server";
              await deleteAccountAction(acc.id);
            }}
            title="Desactivar cuenta"
            description={`La cuenta “${acc.name}” quedará inactiva. Las transacciones existentes se conservan.`}
            confirmLabel="Desactivar"
            trigger={<Button variant="ghost">Desactivar</Button>}
          />
          <Link
            href={`/configuracion`}
            className="mono text-[0.6rem] uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-burgundy)] ml-auto"
          >
            detalle
          </Link>
        </div>
      )}
    </Card>
  );
}

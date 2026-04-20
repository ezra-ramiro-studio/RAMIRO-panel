import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { AccountDialog } from "@/components/dialogs/AccountDialog";
import { AccountMovementsDialog } from "@/components/dialogs/AccountMovementsDialog";
import { DeleteButton } from "@/components/actions/DeleteButton";
import { deleteAccountAction } from "@/lib/actions/accounts";
import {
  fetchAccountMovements,
  fetchAccounts,
  fetchUsers,
  treasuryByAccount,
  treasuryByAccountForPeriod,
  treasuryTotals,
  type TreasuryAccount,
  type AccountMovement,
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

  const [byAccount, totals, accounts, users, movements] = await Promise.all([
    period === "todo"
      ? treasuryByAccount()
      : treasuryByAccountForPeriod(range.from, range.to),
    treasuryTotals(),
    fetchAccounts(),
    fetchUsers(),
    fetchAccountMovements(),
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
            <div className="min-w-[180px]">
              <Select size="sm" name="period" defaultValue={period} aria-label="Período">
                <option value="mes">Mes actual</option>
                <option value="trimestre">Últimos 3 meses</option>
                <option value="ano">Año en curso</option>
                <option value="todo">Histórico</option>
              </Select>
            </div>
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
            return (
              <AccountCard
                key={a.account_id}
                a={a}
                acc={acc}
                users={users}
                movements={movements}
                pagePeriodLabel={range.label}
                pagePeriodIsAll={period === "todo"}
              />
            );
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
            return (
              <AccountCard
                key={a.account_id}
                a={a}
                acc={acc}
                users={users}
                movements={movements}
                pagePeriodLabel={range.label}
                pagePeriodIsAll={period === "todo"}
              />
            );
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
  movements,
  pagePeriodLabel,
  pagePeriodIsAll,
}: {
  a: TreasuryAccount;
  acc: Account | undefined;
  users: User[];
  movements: AccountMovement[];
  pagePeriodLabel: string;
  pagePeriodIsAll: boolean;
}) {
  const footer = acc ? (
    <div className="flex items-center gap-1.5">
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
    </div>
  ) : undefined;

  return (
    <AccountMovementsDialog
      a={a}
      movements={movements}
      pagePeriodLabel={pagePeriodLabel}
      pagePeriodIsAll={pagePeriodIsAll}
      footer={footer}
    />
  );
}

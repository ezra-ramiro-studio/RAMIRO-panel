import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { MarkPaymentPaidButton } from "@/components/actions/MarkPaymentPaidButton";
import { DeleteButton } from "@/components/actions/DeleteButton";
import { deletePaymentAction } from "@/lib/actions/payments";
import {
  fetchAccounts,
  fetchPayments,
  fetchProjects,
  upcomingCollections,
} from "@/lib/queries";
import { formatCurrency, formatDate, daysUntil, relativeDays } from "@/lib/format";

type SearchParams = Promise<{
  type?: string;
  status?: string;
  days?: string;
}>;

export default async function CobrosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { type = "todos", status = "todos", days: daysParam = "30" } = await searchParams;
  const days = Number(daysParam) || 30;

  const [items, payments, projects, accounts] = await Promise.all([
    upcomingCollections(days),
    fetchPayments(),
    fetchProjects(),
    fetchAccounts(),
  ]);

  const paymentById = new Map(payments.map((p) => [p.id, p]));

  const filtered = items.filter((c) => {
    if (type !== "todos" && c.type !== type) return false;
    if (status !== "todos" && c.status !== status) return false;
    return true;
  });

  const totalArs = filtered.filter((x) => x.currency === "ARS").reduce((s, x) => s + x.amount, 0);
  const totalUsd = filtered.filter((x) => x.currency === "USD").reduce((s, x) => s + x.amount, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionTitle kicker="Fin 02">Agenda de cobros</SectionTitle>
        <PaymentDialog
          projects={projects}
          accounts={accounts}
          trigger={<Button tone="fin">+ Nuevo cobro</Button>}
        />
      </div>

      <form
        className="flex items-center gap-3 flex-wrap"
        action=""
        method="get"
      >
        <FilterSelect name="days" value={daysParam} label="Horizonte">
          <option value="15">15 días</option>
          <option value="30">30 días</option>
          <option value="60">60 días</option>
          <option value="90">90 días</option>
        </FilterSelect>
        <FilterSelect name="type" value={type} label="Tipo">
          <option value="todos">Todos</option>
          <option value="proyecto">Proyecto</option>
          <option value="mantenimiento">Mantenimiento</option>
        </FilterSelect>
        <FilterSelect name="status" value={status} label="Estado">
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="vencido">Vencido</option>
          <option value="cobrado">Cobrado</option>
        </FilterSelect>
        <Button type="submit" variant="ghost">Aplicar</Button>
        {(type !== "todos" || status !== "todos" || daysParam !== "30") && (
          <Link
            href="/cobros"
            className="mono text-[0.7rem] uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-burgundy)]"
          >
            limpiar
          </Link>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Stat label={`Esperado ${days} días — ARS`} tone="fin" value={formatCurrency(totalArs, "ARS")} />
        </Card>
        <Card>
          <Stat label={`Esperado ${days} días — USD`} tone="fin" value={formatCurrency(totalUsd, "USD")} />
        </Card>
        <Card>
          <Stat label="Total cobros" value={`${filtered.length}`} hint="Según filtros" />
        </Card>
      </div>

      <Card padding={false}>
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-[0.85rem] text-[var(--color-muted)]">
            No hay cobros con estos filtros.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <Th>Fecha</Th>
                <Th>Cliente</Th>
                <Th>Concepto</Th>
                <Th>Tipo</Th>
                <Th>Monto</Th>
                <Th>Estado</Th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const d = daysUntil(c.date);
                const tone: "red" | "yellow" | "fin" | "muted" =
                  c.status === "vencido"
                    ? "red"
                    : c.status === "cobrado"
                    ? "fin"
                    : d <= 7
                    ? "yellow"
                    : "muted";
                const payment = c.type === "proyecto" ? paymentById.get(c.id) : undefined;
                return (
                  <tr key={`${c.type}-${c.id}`} className="border-t border-[var(--color-border-1)]">
                    <td className="px-5 py-3">
                      <div className="text-[0.85rem]">{formatDate(c.date)}</div>
                      <div className="mono text-[0.64rem] text-[var(--color-muted)]">
                        {relativeDays(d)}
                      </div>
                    </td>
                    <td className="px-5 py-3 display font-semibold text-[0.85rem]">{c.client}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[var(--color-muted)]">
                      {c.project} · {c.description}
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={c.type === "mantenimiento" ? "cyan" : "ops"}>{c.type}</Pill>
                    </td>
                    <td className="px-5 py-3 mono text-[0.85rem] font-semibold">
                      {formatCurrency(c.amount, c.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={tone}>{c.status}</Pill>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {payment && (
                        <div className="inline-flex items-center gap-1.5">
                          {c.status !== "cobrado" && (
                            <MarkPaymentPaidButton id={payment.id} accounts={accounts} />
                          )}
                          <PaymentDialog
                            projects={projects}
                            accounts={accounts}
                            payment={payment}
                            trigger={<Button variant="ghost">Editar</Button>}
                          />
                          <DeleteButton
                            onConfirm={async () => {
                              "use server";
                              await deletePaymentAction(payment.id);
                            }}
                            title="Eliminar cobro"
                            description={`Vas a eliminar “${payment.description}”. Esta acción no se puede deshacer.`}
                            trigger={<Button variant="ghost">Eliminar</Button>}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted)] font-medium px-5 py-3">
      {children}
    </th>
  );
}

function FilterSelect({
  name,
  value,
  label,
  children,
}: {
  name: string;
  value: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
        {label}
      </span>
      <div className="min-w-[140px]">
        <Select size="sm" name={name} defaultValue={value} aria-label={label}>
          {children}
        </Select>
      </div>
    </div>
  );
}

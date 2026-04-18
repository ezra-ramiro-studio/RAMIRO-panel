"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Card, CardTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { formatCurrency, formatDate } from "@/lib/format";
import type { AccountMovement, TreasuryAccount } from "@/lib/queries";

type Period = "mes" | "trimestre" | "ano" | "todo";

interface Props {
  a: TreasuryAccount;
  movements: AccountMovement[];
  pagePeriodLabel: string;
  pagePeriodIsAll: boolean;
  footer?: ReactNode;
}

export function AccountMovementsDialog({
  a,
  movements,
  pagePeriodLabel,
  pagePeriodIsAll,
  footer,
}: Props) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("mes");

  const accountMovs = useMemo(
    () => movements.filter((m) => m.account_id === a.account_id),
    [movements, a.account_id],
  );

  const filtered = useMemo(() => {
    if (period === "todo") return accountMovs;
    const now = new Date();
    let from: Date;
    if (period === "mes") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "trimestre") {
      from = new Date(now);
      from.setMonth(now.getMonth() - 2);
      from.setDate(1);
    } else {
      from = new Date(now.getFullYear(), 0, 1);
    }
    return accountMovs.filter((m) => new Date(m.date) >= from);
  }, [accountMovs, period]);

  const ingresos = filtered
    .filter((m) => m.kind === "ingreso")
    .reduce((s, m) => s + m.amount, 0);
  const egresos = filtered
    .filter((m) => m.kind === "egreso")
    .reduce((s, m) => s + m.amount, 0);
  const net = ingresos - egresos;

  const periodLabel: Record<Period, string> = {
    mes: "Mes actual",
    trimestre: "Últimos 3 meses",
    ano: "Año en curso",
    todo: "Histórico",
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-burgundy focus:ring-offset-2 rounded-[10px] transition-transform hover:-translate-y-0.5"
      >
        <Card hover>
          <CardTitle badge={<Pill tone="muted">{a.owner}</Pill>}>{a.name}</CardTitle>
          <Stat
            label={pagePeriodIsAll ? `Balance ${a.currency}` : `Flujo neto ${a.currency}`}
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
              <div
                className="mono mt-0.5"
                style={{ color: a.outflow > 0 ? "#A6352C" : undefined }}
              >
                {formatCurrency(a.outflow, a.currency)}
              </div>
            </div>
            <div>
              <div className="mono text-[0.58rem] uppercase tracking-wider text-[var(--color-muted)]">
                Movimientos
              </div>
              <div className="mono mt-0.5">{accountMovs.length}</div>
            </div>
          </div>
          {footer && (
            <div
              className="pt-3 mt-3 border-t border-[var(--color-border-1)]"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {footer}
            </div>
          )}
          <div className="mono text-[0.58rem] uppercase tracking-wider text-muted mt-3 text-right">
            Ver movimientos →
          </div>
          <span className="sr-only">{pagePeriodLabel}</span>
        </Card>
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`${a.name} · movimientos`}
        description={`Cuenta ${a.currency} de ${a.owner} · Balance histórico ${formatCurrency(a.balance, a.currency)}`}
        widthClass="max-w-[860px]"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              Período
            </span>
            {(["mes", "trimestre", "ano", "todo"] as Period[]).map((p) => {
              const active = period === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`mono text-[0.68rem] uppercase tracking-wider px-3 py-1.5 rounded-[7px] border transition ${
                    active
                      ? "bg-burgundy text-white border-burgundy"
                      : "bg-[var(--color-surface)] border-[var(--color-border-2)] text-[var(--color-muted)] hover:text-[var(--color-burgundy)]"
                  }`}
                >
                  {periodLabel[p]}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card>
              <Stat
                label="Ingresos"
                tone="fin"
                value={formatCurrency(ingresos, a.currency)}
              />
            </Card>
            <Card>
              <div>
                <div className="mono text-[9px] tracking-[0.2em] uppercase text-muted mb-1.5">
                  Egresos
                </div>
                <div
                  className="display text-[30px] leading-none tracking-[0.02em]"
                  style={{ color: egresos > 0 ? "#A6352C" : "var(--color-muted)" }}
                >
                  {formatCurrency(egresos, a.currency)}
                </div>
              </div>
            </Card>
            <Card>
              <div>
                <div className="mono text-[9px] tracking-[0.2em] uppercase text-muted mb-1.5">
                  Flujo neto
                </div>
                <div
                  className="display text-[30px] leading-none tracking-[0.02em]"
                  style={{ color: net >= 0 ? "#4A7A3E" : "#A6352C" }}
                >
                  {formatCurrency(net, a.currency)}
                </div>
              </div>
            </Card>
          </div>

          <Card padding={false}>
            {filtered.length === 0 ? (
              <div className="px-5 py-10 text-center text-[0.85rem] text-[var(--color-muted)]">
                No hay movimientos en este período.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <Th>Fecha</Th>
                    <Th>Tipo</Th>
                    <Th>Contraparte</Th>
                    <Th>Descripción</Th>
                    <Th className="text-right">Monto</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-t border-[var(--color-border-1)]">
                      <td className="px-5 py-3 text-[0.82rem]">{formatDate(m.date)}</td>
                      <td className="px-5 py-3">
                        <Pill tone={m.kind === "ingreso" ? "fin" : "red"}>
                          {m.source}
                        </Pill>
                      </td>
                      <td className="px-5 py-3 display font-semibold text-[0.82rem]">
                        {m.counterpart}
                      </td>
                      <td className="px-5 py-3 text-[0.8rem] text-[var(--color-muted)]">
                        {m.description}
                      </td>
                      <td
                        className="px-5 py-3 mono text-[0.85rem] font-semibold text-right whitespace-nowrap"
                        style={{ color: m.kind === "ingreso" ? "#4A7A3E" : "#A6352C" }}
                      >
                        {m.kind === "ingreso" ? "+" : "−"}
                        {formatCurrency(m.amount, m.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </Dialog>
    </>
  );
}

function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted)] font-medium px-5 py-3 ${className}`}
    >
      {children}
    </th>
  );
}

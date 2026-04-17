import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { clientSummaries } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";

export default function ClientesPage() {
  const summaries = clientSummaries();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Op 02" italicTail="clientes">
          Panel
        </SectionTitle>
        <Button tone="primary">+ Nuevo cliente</Button>
      </div>

      <Card padding={false}>
        <div className="px-5 py-3 flex items-center gap-3 border-b border-[var(--color-border-1)]">
          <input
            type="text"
            placeholder="Buscar cliente…"
            className="bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-[6px] px-3 py-2 text-[13px] flex-1 outline-none focus:border-[var(--color-burgundy)] placeholder:text-[var(--color-muted)]"
          />
          <select className="bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-[6px] px-3 py-2 text-[13px] outline-none focus:border-[var(--color-burgundy)]">
            <option>Todos</option>
            <option>Activos</option>
            <option>Inactivos</option>
          </select>
        </div>
        <table className="w-full">
          <thead>
            <tr
              className="text-left"
              style={{ background: "var(--color-surface-2)" }}
            >
              <th className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold px-5 py-3">Cliente</th>
              <th className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold px-5 py-3">Industria</th>
              <th className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold px-5 py-3">Estado</th>
              <th className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold px-5 py-3">Proyectos</th>
              <th className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold px-5 py-3 text-right">Facturado</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((c) => (
              <tr
                key={c.id}
                className="border-t border-[var(--color-border-1)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="text-[14px] font-semibold hover:text-[var(--color-burgundy)] transition-colors"
                    style={{ fontFamily: "var(--font-syne)", letterSpacing: "0.02em" }}
                  >
                    {c.name}
                  </Link>
                  <div className="text-[12px] text-[var(--color-muted)] mt-0.5">{c.contact}</div>
                </td>
                <td className="px-5 py-4 text-[13px]">{c.industry}</td>
                <td className="px-5 py-4">
                  <Pill tone={c.is_active ? "fin" : "muted"}>
                    {c.is_active ? "activo" : "inactivo"}
                  </Pill>
                </td>
                <td className="px-5 py-4">
                  <span className="display text-[18px]" style={{ color: "var(--color-burgundy)" }}>
                    {c.active_projects}
                  </span>
                  <span className="serif italic text-[12px] text-[var(--color-muted)] ml-1">activos</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div
                    className="display text-[16px]"
                    style={{ color: "var(--color-burgundy)" }}
                  >
                    {formatCurrency(c.billed_ars, "ARS")}
                  </div>
                  {c.billed_usd > 0 && (
                    <div className="text-[11px] text-[var(--color-muted)] mt-0.5">
                      {formatCurrency(c.billed_usd, "USD")}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

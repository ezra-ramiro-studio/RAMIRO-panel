import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Select } from "@/components/ui/Field";
import { profitabilityByClient, profitabilityByProject } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";

function marginTone(m: number): "fin" | "yellow" | "red" {
  if (m >= 30) return "fin";
  if (m >= 10) return "yellow";
  return "red";
}

export default async function RentabilidadPage() {
  const [byProjectRaw, byClientRaw] = await Promise.all([
    profitabilityByProject(),
    profitabilityByClient(),
  ]);
  const byProject = byProjectRaw.sort((a, b) => b.margin - a.margin);
  const byClient = byClientRaw.sort((a, b) => b.margin - a.margin);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Fin 04">Rentabilidad</SectionTitle>
        <div className="min-w-[180px]">
          <Select size="sm" aria-label="Período">
            <option value="todo">Todo el período</option>
            <option value="mes">Mes actual</option>
            <option value="trimestre">Trimestre</option>
            <option value="ano">Año</option>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="display text-lg font-semibold">Por proyecto</h2>
          <Pill tone="muted">{byProject.length}</Pill>
        </div>
        <Card padding={false}>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <Th>Proyecto</Th>
                <Th>Cliente</Th>
                <Th>Ingresos</Th>
                <Th>Insumos</Th>
                <Th>Neto</Th>
                <Th>Margen</Th>
              </tr>
            </thead>
            <tbody>
              {byProject.map((p) => (
                <tr key={p.project_id} className="border-t border-[var(--color-border-1)]">
                  <td className="px-5 py-3 display font-semibold text-[0.85rem]">{p.project}</td>
                  <td className="px-5 py-3 text-[0.82rem]">{p.client}</td>
                  <td className="px-5 py-3 mono text-[0.82rem]">{formatCurrency(p.income, p.currency)}</td>
                  <td className="px-5 py-3 mono text-[0.82rem] text-[var(--color-muted)]">
                    {p.expenses > 0 ? formatCurrency(p.expenses, "USD") : "—"}
                  </td>
                  <td className="px-5 py-3 mono text-[0.85rem] font-semibold">
                    {formatCurrency(p.net, p.currency)}
                  </td>
                  <td className="px-5 py-3">
                    {p.income > 0 ? (
                      <Pill tone={marginTone(p.margin)}>{p.margin.toFixed(0)}%</Pill>
                    ) : (
                      <span className="text-[0.75rem] text-[var(--color-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="display text-lg font-semibold">Por cliente</h2>
          <Pill tone="muted">{byClient.length}</Pill>
        </div>
        <Card padding={false}>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <Th>Cliente</Th>
                <Th>Proyectos</Th>
                <Th>Ingresos</Th>
                <Th>Egresos</Th>
                <Th>Neto</Th>
                <Th>Margen</Th>
              </tr>
            </thead>
            <tbody>
              {byClient.map((c) => (
                <tr key={c.client_id} className="border-t border-[var(--color-border-1)]">
                  <td className="px-5 py-3 display font-semibold text-[0.85rem]">{c.client}</td>
                  <td className="px-5 py-3 mono text-[0.82rem]">{c.projects}</td>
                  <td className="px-5 py-3 mono text-[0.82rem]">{formatCurrency(c.income, c.currency)}</td>
                  <td className="px-5 py-3 mono text-[0.82rem] text-[var(--color-muted)]">
                    {c.expenses > 0 ? formatCurrency(c.expenses, "USD") : "—"}
                  </td>
                  <td className="px-5 py-3 mono text-[0.85rem] font-semibold">
                    {formatCurrency(c.net, c.currency)}
                  </td>
                  <td className="px-5 py-3">
                    {c.income > 0 ? (
                      <Pill tone={marginTone(c.margin)}>{c.margin.toFixed(0)}%</Pill>
                    ) : (
                      <span className="text-[0.75rem] text-[var(--color-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
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

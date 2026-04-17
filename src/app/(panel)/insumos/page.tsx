import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { expenses } from "@/lib/mock";
import { getProject } from "@/lib/queries";
import { formatCurrency, formatDate, daysUntil, relativeDays } from "@/lib/format";

export default function InsumosPage() {
  const monthlyARS = expenses
    .filter((e) => e.frequency === "mensual" && e.currency === "ARS")
    .reduce((s, e) => s + e.cost, 0);
  const monthlyUSD = expenses
    .filter((e) => e.frequency === "mensual" && e.currency === "USD")
    .reduce((s, e) => s + e.cost, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Fin 03">Insumos / egresos</SectionTitle>
        <Button tone="fin">+ Nuevo insumo</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Stat label="Egresos mensuales ARS" tone="fin" value={formatCurrency(monthlyARS, "ARS")} />
        </Card>
        <Card>
          <Stat label="Egresos mensuales USD" tone="fin" value={formatCurrency(monthlyUSD, "USD")} />
        </Card>
        <Card>
          <Stat label="Total insumos" value={`${expenses.length}`} />
        </Card>
      </div>

      <Card padding={false}>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <Th>Nombre</Th>
              <Th>Categoría</Th>
              <Th>Costo</Th>
              <Th>Frecuencia</Th>
              <Th>Próximo vencimiento</Th>
              <Th>Imputado a</Th>
              <Th>&nbsp;</Th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => {
              const d = daysUntil(e.next_due_date);
              const tone = d <= 5 ? "red" : d <= 14 ? "yellow" : "muted";
              const proj = e.project_id ? getProject(e.project_id) : null;
              return (
                <tr key={e.id} className="border-t border-[var(--color-border-1)]">
                  <td className="px-5 py-3 display font-semibold text-[0.85rem]">{e.name}</td>
                  <td className="px-5 py-3 text-[0.82rem] text-[var(--color-muted)]">
                    {e.category}
                  </td>
                  <td className="px-5 py-3 mono text-[0.82rem]">
                    {formatCurrency(e.cost, e.currency)}
                  </td>
                  <td className="px-5 py-3">
                    <Pill tone="muted">{e.frequency}</Pill>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-[0.8rem]">{formatDate(e.next_due_date)}</div>
                    <div className="mono text-[0.62rem]" style={{ color: tone === "red" ? "#A6352C" : "#6b7fa0" }}>
                      {relativeDays(d)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[0.8rem]">
                    {proj ? (
                      <Pill tone="ops">{proj.name}</Pill>
                    ) : (
                      <span className="text-[var(--color-muted)] text-[0.75rem]">Negocio</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost">Marcar pagado</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

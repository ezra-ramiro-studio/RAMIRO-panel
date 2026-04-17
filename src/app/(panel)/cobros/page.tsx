import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { upcomingCollections } from "@/lib/queries";
import { formatCurrency, formatDate, daysUntil, relativeDays } from "@/lib/format";

export default function CobrosPage() {
  const items = upcomingCollections(30);
  const totalArs = items.filter((x) => x.currency === "ARS").reduce((s, x) => s + x.amount, 0);
  const totalUsd = items.filter((x) => x.currency === "USD").reduce((s, x) => s + x.amount, 0);

  return (
    <div className="flex flex-col gap-8">
      <SectionTitle kicker="Fin 02">Agenda de cobros</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Stat label="Esperado 30 días — ARS" tone="fin" value={formatCurrency(totalArs, "ARS")} />
        </Card>
        <Card>
          <Stat label="Esperado 30 días — USD" tone="fin" value={formatCurrency(totalUsd, "USD")} />
        </Card>
        <Card>
          <Stat label="Total cobros" value={`${items.length}`} hint="Entre proyectos y mantenimiento" />
        </Card>
      </div>

      <Card padding={false}>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <Th>Fecha</Th>
              <Th>Cliente</Th>
              <Th>Concepto</Th>
              <Th>Tipo</Th>
              <Th>Monto</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => {
              const d = daysUntil(c.date);
              const tone: "red" | "yellow" | "fin" | "muted" =
                c.status === "vencido"
                  ? "red"
                  : c.status === "cobrado"
                  ? "fin"
                  : d <= 7
                  ? "yellow"
                  : "muted";
              return (
                <tr key={c.id} className="border-t border-[var(--color-border-1)]">
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

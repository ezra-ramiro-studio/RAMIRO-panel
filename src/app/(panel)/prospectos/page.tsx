import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { prospectsByStage, closeRate, getUser } from "@/lib/queries";
import { PROSPECT_STAGES } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

export default function ProspectosPage() {
  const stages = prospectsByStage();
  const rate = closeRate();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Crec 01">Pipeline de prospectos</SectionTitle>
        <div className="flex gap-2">
          <Button variant="ghost">Vista lista</Button>
          <Button tone="grow">+ Nuevo prospecto</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Stat label="Tasa de cierre" tone="grow" value={`${rate.toFixed(0)}%`} hint="Ganados / cerrados" />
        </Card>
        {stages.slice(0, 3).map((s) => (
          <Card key={s.stage}>
            <Stat
              label={PROSPECT_STAGES.find((x) => x.key === s.stage)?.label ?? s.stage}
              value={`${s.items.length}`}
              tone="grow"
            />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {stages.map((s) => {
          const label = PROSPECT_STAGES.find((x) => x.key === s.stage)?.label ?? s.stage;
          const tone: "grow" | "fin" | "red" =
            s.stage === "cerrado_ganado"
              ? "fin"
              : s.stage === "cerrado_perdido"
              ? "red"
              : "grow";
          return (
            <div key={s.stage} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2">
                <div className="display font-semibold text-[0.82rem]">{label}</div>
                <Pill tone={tone}>{s.items.length}</Pill>
              </div>
              <div className="flex flex-col gap-2 min-h-[300px]">
                {s.items.length === 0 ? (
                  <div className="rounded-[10px] border border-dashed border-[var(--color-border-2)] p-4 text-center text-[0.72rem] text-[var(--color-muted)]">
                    Sin prospectos
                  </div>
                ) : (
                  s.items.map((p) => {
                    const u = getUser(p.responsible_id);
                    return (
                      <div
                        key={p.id}
                        className="rounded-[10px] border border-[var(--color-border-2)] bg-[var(--color-surface)] p-3 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                      >
                        <div className="display font-semibold text-[0.85rem]">{p.name}</div>
                        {p.company && (
                          <div className="text-[0.7rem] text-[var(--color-muted)]">{p.company}</div>
                        )}
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <Pill tone="muted">{p.source.replace("_", " ")}</Pill>
                          {u && <Pill tone={u.color ?? "muted"}>{u.name}</Pill>}
                        </div>
                        {p.estimated_amount && p.currency && (
                          <div className="mono text-[0.82rem] font-semibold mt-2" style={{ color: "#C47A3E" }}>
                            {formatCurrency(p.estimated_amount, p.currency)}
                          </div>
                        )}
                        {p.next_step && (
                          <div className="text-[0.68rem] text-[var(--color-muted)] mt-1.5">
                            {p.next_step}
                            {p.next_step_date && ` · ${formatDate(p.next_step_date)}`}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

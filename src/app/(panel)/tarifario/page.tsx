import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { services } from "@/lib/mock";
import { formatCurrency } from "@/lib/format";

export default function TarifarioPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Crec 02">Tarifario</SectionTitle>
        <Button tone="grow">+ Nuevo servicio</Button>
      </div>

      <Card className="flex items-start gap-3" padding={true}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(196,122,62,0.12)", color: "#C47A3E" }}
        >
          ✺
        </div>
        <div>
          <div className="display font-semibold text-[0.9rem]">Precios de referencia</div>
          <div className="text-[0.78rem] text-[var(--color-muted)] mt-0.5">
            Estos valores son la base. Cada proyecto se ajusta según alcance, complejidad y relación.
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <Card key={s.id} hover>
            <div className="flex items-center justify-between mb-3">
              <Pill tone="grow">{s.type}</Pill>
              {s.delivery_time && <Pill tone="muted">{s.delivery_time}</Pill>}
            </div>
            <div className="display font-bold text-[1.05rem] mb-1">{s.name}</div>
            <div className="text-[0.78rem] text-[var(--color-muted)] mb-4 leading-relaxed">
              {s.description}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--color-border-1)]">
              <div>
                <div className="mono text-[0.58rem] uppercase tracking-wider text-[var(--color-muted)]">
                  ARS
                </div>
                <div className="display font-bold text-[1.05rem] mt-0.5">
                  {formatCurrency(s.price_ars, "ARS")}
                </div>
              </div>
              <div>
                <div className="mono text-[0.58rem] uppercase tracking-wider text-[var(--color-muted)]">
                  USD
                </div>
                <div className="display font-bold text-[1.05rem] mt-0.5">
                  {formatCurrency(s.price_usd, "USD")}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

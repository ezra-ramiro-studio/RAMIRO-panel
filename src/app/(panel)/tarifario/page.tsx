import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { ServiceDialog } from "@/components/dialogs/ServiceDialog";
import { DeleteButton } from "@/components/actions/DeleteButton";
import { deleteServiceAction } from "@/lib/actions/services";
import { fetchServices } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";

export default async function TarifarioPage() {
  const services = await fetchServices();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Crec 02">Tarifario</SectionTitle>
        <ServiceDialog trigger={<Button tone="grow">+ Nuevo servicio</Button>} />
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

      {services.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-[0.85rem] text-[var(--color-muted)]">
            Todavía no tenés servicios. Creá el primero con <strong>+ Nuevo servicio</strong>.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <Card key={s.id} hover>
              <div className="flex items-center justify-between mb-3">
                <Pill tone="grow">{s.type}</Pill>
                {s.estimated_delivery_days && (
                  <Pill tone="muted">{s.estimated_delivery_days} días</Pill>
                )}
              </div>
              <div className="display font-bold text-[1.05rem] mb-1">{s.name}</div>
              {s.description && (
                <div className="text-[0.78rem] text-[var(--color-muted)] mb-4 leading-relaxed">
                  {s.description}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--color-border-1)]">
                <div>
                  <div className="mono text-[0.58rem] uppercase tracking-wider text-[var(--color-muted)]">
                    ARS
                  </div>
                  <div className="display font-bold text-[1.05rem] mt-0.5">
                    {s.price_ars ? formatCurrency(s.price_ars, "ARS") : "—"}
                  </div>
                </div>
                <div>
                  <div className="mono text-[0.58rem] uppercase tracking-wider text-[var(--color-muted)]">
                    USD
                  </div>
                  <div className="display font-bold text-[1.05rem] mt-0.5">
                    {s.price_usd ? formatCurrency(s.price_usd, "USD") : "—"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[var(--color-border-1)]">
                <ServiceDialog
                  service={s}
                  trigger={<Button variant="ghost">Editar</Button>}
                />
                <DeleteButton
                  onConfirm={async () => {
                    "use server";
                    await deleteServiceAction(s.id);
                  }}
                  title="Eliminar servicio"
                  description={`Vas a eliminar “${s.name}” del tarifario.`}
                  trigger={<Button variant="ghost">Eliminar</Button>}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardTitle, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { getClient, projectsByClient } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { PHASES } from "@/lib/types";

type Params = { id: string };

export default async function ClienteDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) return notFound();
  const projects = projectsByClient(id);
  const phaseLabel = (p: string) => PHASES.find((x) => x.key === p)?.label ?? p;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="mono text-[0.62rem] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-1">
            Op 03 · <Link href="/clientes" className="hover:text-[var(--color-ops)]">Clientes</Link> / Detalle
          </div>
          <h1 className="display text-2xl font-bold">{client.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Pill tone={client.is_active ? "fin" : "muted"}>
              {client.is_active ? "activo" : "inactivo"}
            </Pill>
            <Pill tone="muted">{client.industry}</Pill>
            <Pill tone="ops">{client.preferred_currency}</Pill>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost">Editar</Button>
          <Button tone="ops">+ Nuevo proyecto</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1">
          <CardTitle>Datos</CardTitle>
          <div className="flex flex-col gap-3 text-[0.85rem]">
            <Field label="Contacto" value={client.contact} />
            <Field label="Teléfono" value={client.phone} />
            <Field label="Email" value={client.email} />
            <Field label="Moneda preferida" value={client.preferred_currency} />
            <Field label="Cliente desde" value={formatDate(client.created_at)} />
            {client.notes && <Field label="Notas" value={client.notes} />}
          </div>
          <div className="mt-5 pt-5 border-t border-[var(--color-border-1)]">
            <Link
              href={`/audit?entity=client:${client.id}`}
              className="text-[0.75rem] text-[var(--color-muted)] hover:text-[var(--color-fin)]"
            >
              Ver audit log →
            </Link>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="display text-[0.95rem] font-semibold">Proyectos</h3>
              <Pill tone="ops">{projects.length}</Pill>
            </div>
            {projects.length === 0 ? (
              <div className="px-5 pb-6 text-[0.8rem] text-[var(--color-muted)]">
                Este cliente todavía no tiene proyectos.
              </div>
            ) : (
              <div className="border-t border-[var(--color-border-1)]">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/proyectos/${p.id}`}
                    className="block px-5 py-4 border-b border-[var(--color-border-1)] last:border-b-0 hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="display font-semibold text-[0.92rem]">{p.name}</div>
                        <div className="text-[0.75rem] text-[var(--color-muted)] truncate">
                          {p.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Pill tone="ops">{phaseLabel(p.phase)}</Pill>
                        <Pill tone={p.status === "activo" ? "fin" : p.status === "completado" ? "cyan" : "muted"}>
                          {p.status}
                        </Pill>
                        <div className="mono text-[0.85rem] font-semibold">
                          {formatCurrency(p.total_amount, p.currency)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono text-[0.6rem] uppercase tracking-wider text-[var(--color-muted)] mb-0.5">
        {label}
      </div>
      <div>{value}</div>
    </div>
  );
}

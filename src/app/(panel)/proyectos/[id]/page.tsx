import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import {
  auditLog,
  communications,
  decisions,
  maintenancePayments,
  maintenances,
  projectFiles,
} from "@/lib/mock";
import {
  getClient,
  getProject,
  getUser,
  paymentsByProject,
  tasksByProject,
} from "@/lib/queries";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { PHASES, type ProjectPhase } from "@/lib/types";

type Params = { id: string };

export default async function ProjectDetail({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return notFound();
  const client = getClient(project.client_id);
  const responsible = getUser(project.responsible_id);
  const tasks = tasksByProject(id);
  const payments = paymentsByProject(id);
  const files = projectFiles.filter((f) => f.project_id === id);
  const projectDecisions = decisions.filter((d) => d.project_id === id);
  const comms = communications.filter((c) => c.project_id === id);
  const projectAudit = auditLog
    .filter((a) => a.entity_id === id || a.description.toLowerCase().includes(project.name.toLowerCase()))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const projectMaints = maintenances.filter((m) => m.project_id === id);
  const phaseLabel = (p: ProjectPhase) => PHASES.find((x) => x.key === p)?.label ?? p;

  const priorityTone: Record<string, "red" | "gold" | "cyan" | "muted"> = {
    urgente: "red",
    alta: "gold",
    media: "cyan",
    baja: "muted",
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mono text-[0.62rem] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-1">
          Op 04 · <Link href="/clientes" className="hover:text-[var(--color-ops)]">Clientes</Link> /{" "}
          {client && (
            <Link href={`/clientes/${client.id}`} className="hover:text-[var(--color-ops)]">
              {client.name}
            </Link>
          )}{" "}
          / Proyecto
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="display text-2xl font-bold">{project.name}</h1>
            <div className="text-[0.85rem] text-[var(--color-muted)] mt-1">
              {project.description}
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Pill tone={project.status === "activo" ? "fin" : "muted"}>{project.status}</Pill>
              <Pill tone="ops">{phaseLabel(project.phase)}</Pill>
              <Pill tone="muted">
                {formatDate(project.start_date)}
                {project.end_date && ` → ${formatDate(project.end_date)}`}
              </Pill>
              <Pill tone="grow">{responsible?.name}</Pill>
            </div>
          </div>
          <div className="text-right">
            <div className="mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted)]">
              Total
            </div>
            <div className="display text-xl font-bold mt-1">
              {formatCurrency(project.total_amount, project.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Fases */}
      <Card>
        <CardTitle badge={<Button variant="ghost">Cambiar fase</Button>}>Fases</CardTitle>
        <div className="flex items-center flex-wrap gap-2">
          {PHASES.filter((p) => p.key !== "archivado").map((p, i, arr) => {
            const active = project.phase === p.key;
            const past = arr.findIndex((x) => x.key === project.phase) > i;
            return (
              <div key={p.key} className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-[0.75rem] font-medium border"
                  style={
                    active
                      ? {
                          background: "rgba(107,31,43,0.09)",
                          borderColor: "rgba(107,31,43,0.38)",
                          color: "#6B1F2B",
                        }
                      : past
                      ? {
                          background: "rgba(74,122,62,0.06)",
                          borderColor: "rgba(74,122,62,0.25)",
                          color: "#4A7A3E",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          borderColor: "rgba(255,255,255,0.1)",
                          color: "#6b7fa0",
                        }
                  }
                >
                  {p.label}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-[var(--color-muted)] text-xs">→</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. Tareas */}
      <Card padding={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="display text-[0.95rem] font-semibold">Tareas</h3>
          <Button tone="ops">+ Nueva tarea</Button>
        </div>
        {tasks.length === 0 ? (
          <div className="px-5 pb-5 text-[0.8rem] text-[var(--color-muted)]">Sin tareas.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <Th>Título</Th>
                <Th>Asignado</Th>
                <Th>Prioridad</Th>
                <Th>Estado</Th>
                <Th>Fecha límite</Th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const u = getUser(t.assigned_to);
                return (
                  <tr key={t.id} className="border-t border-[var(--color-border-1)]">
                    <td className="px-5 py-3 text-[0.85rem]">{t.title}</td>
                    <td className="px-5 py-3">
                      <Pill tone={u?.color ?? "muted"}>{u?.name}</Pill>
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={priorityTone[t.priority]}>{t.priority}</Pill>
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={t.status === "completada" ? "fin" : t.status === "en_progreso" ? "cyan" : "yellow"}>
                        {t.status.replace("_", " ")}
                      </Pill>
                    </td>
                    <td className="px-5 py-3 text-[0.8rem]">{formatDate(t.due_date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* 3. Pagos */}
      <Card padding={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="display text-[0.95rem] font-semibold">Pagos</h3>
          <Button tone="fin">+ Registrar hito</Button>
        </div>
        {payments.length === 0 ? (
          <div className="px-5 pb-5 text-[0.8rem] text-[var(--color-muted)]">Sin pagos.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <Th>Descripción</Th>
                <Th>Monto</Th>
                <Th>Fecha</Th>
                <Th>Estado</Th>
                <Th>Cobrado por</Th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const u = p.collected_by ? getUser(p.collected_by) : null;
                return (
                  <tr key={p.id} className="border-t border-[var(--color-border-1)]">
                    <td className="px-5 py-3 text-[0.85rem]">{p.description}</td>
                    <td className="px-5 py-3 mono text-[0.8rem]">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="px-5 py-3 text-[0.8rem]">{formatDate(p.scheduled_date)}</td>
                    <td className="px-5 py-3">
                      <Pill tone={p.status === "cobrado" ? "fin" : p.status === "vencido" ? "red" : "yellow"}>
                        {p.status}
                      </Pill>
                    </td>
                    <td className="px-5 py-3">
                      {u ? <Pill tone={u.color ?? "muted"}>{u.name}</Pill> : <span className="text-[var(--color-muted)] text-[0.75rem]">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* 4. Mantenimiento (solo si soporte) */}
      {project.phase === "soporte" && (
        <Card padding={false}>
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="display text-[0.95rem] font-semibold">Mantenimiento mensual</h3>
            <Button tone="fin">+ Nuevo mantenimiento</Button>
          </div>
          {projectMaints.length === 0 ? (
            <div className="px-5 pb-5 text-[0.8rem] text-[var(--color-muted)]">Sin contratos.</div>
          ) : (
            <div className="border-t border-[var(--color-border-1)]">
              {projectMaints.map((m) => {
                const payments = maintenancePayments.filter((mp) => mp.maintenance_id === m.id);
                return (
                  <div key={m.id} className="px-5 py-4 border-b border-[var(--color-border-1)] last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="display font-semibold text-[0.88rem]">{m.description}</div>
                        <div className="text-[0.72rem] text-[var(--color-muted)]">
                          {formatCurrency(m.amount, m.currency)} · día {m.billing_day} de cada mes
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {payments.map((p) => (
                        <Pill key={p.id} tone={p.status === "cobrado" ? "fin" : "yellow"}>
                          {p.period} · {p.status}
                        </Pill>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 5. Archivos */}
        <Card>
          <CardTitle badge={<Button variant="ghost">+ Link</Button>}>Archivos y links</CardTitle>
          {files.length === 0 ? (
            <div className="text-[0.8rem] text-[var(--color-muted)]">Sin archivos.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {files.map((f) => (
                <a
                  key={f.id}
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between py-2 px-3 rounded-[7px] border border-[var(--color-border-1)] hover:border-[var(--color-ops-line)] transition-colors"
                >
                  <div>
                    <div className="display font-semibold text-[0.82rem]">{f.name}</div>
                    <div className="text-[0.68rem] text-[var(--color-muted)] truncate max-w-[320px]">
                      {f.url}
                    </div>
                  </div>
                  <Pill tone="ops">{f.type}</Pill>
                </a>
              ))}
            </div>
          )}
        </Card>

        {/* 6. Decisiones */}
        <Card>
          <CardTitle badge={<Button variant="ghost">+ Decisión</Button>}>Log de decisiones</CardTitle>
          {projectDecisions.length === 0 ? (
            <div className="text-[0.8rem] text-[var(--color-muted)]">Sin decisiones registradas.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {projectDecisions.map((d) => {
                const u = getUser(d.decided_by);
                return (
                  <div
                    key={d.id}
                    className="py-2.5 px-3 rounded-[7px] border border-[var(--color-border-1)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="display font-semibold text-[0.85rem]">{d.title}</div>
                      <Pill tone={u?.color ?? "muted"}>{u?.name}</Pill>
                    </div>
                    <div className="text-[0.75rem] text-[var(--color-muted)] mt-1">
                      {d.description}
                    </div>
                    <div className="mono text-[0.65rem] text-[var(--color-muted)] mt-1">
                      {formatDate(d.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 7. Comunicaciones */}
        <Card>
          <CardTitle badge={<Button variant="ghost">+ Contacto</Button>}>Comunicaciones</CardTitle>
          {comms.length === 0 ? (
            <div className="text-[0.8rem] text-[var(--color-muted)]">Sin comunicaciones.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {comms.map((c) => {
                const u = getUser(c.contacted_by);
                return (
                  <div
                    key={c.id}
                    className="py-2.5 px-3 rounded-[7px] border border-[var(--color-border-1)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="display font-semibold text-[0.85rem]">{c.subject}</div>
                      <Pill tone="cyan">{c.type}</Pill>
                    </div>
                    <div className="text-[0.75rem] text-[var(--color-muted)] mt-1">{c.content}</div>
                    <div className="mono text-[0.65rem] text-[var(--color-muted)] mt-1">
                      {u?.name} · {formatDate(c.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 8. Audit log del proyecto */}
        <Card>
          <CardTitle badge={<Pill tone="muted" mono>FIN 05</Pill>}>Audit log del proyecto</CardTitle>
          {projectAudit.length === 0 ? (
            <div className="text-[0.8rem] text-[var(--color-muted)]">Sin entradas.</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {projectAudit.slice(0, 8).map((a) => {
                const u = getUser(a.user_id);
                return (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] shrink-0"
                      style={{
                        background:
                          u?.color === "ops"
                            ? "rgba(107,31,43,0.15)"
                            : "rgba(196,122,62,0.15)",
                      }}
                    >
                      {u?.avatar_emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[0.78rem]">{a.description}</div>
                      <div className="mono text-[0.62rem] text-[var(--color-muted)] mt-0.5">
                        {formatDateTime(a.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

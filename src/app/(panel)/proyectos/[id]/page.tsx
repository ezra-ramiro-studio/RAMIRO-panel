import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { TaskDialog } from "@/components/dialogs/TaskDialog";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { MaintenanceDialog } from "@/components/dialogs/MaintenanceDialog";
import { ProjectFileDialog } from "@/components/dialogs/ProjectFileDialog";
import { DecisionDialog } from "@/components/dialogs/DecisionDialog";
import { CommunicationDialog } from "@/components/dialogs/CommunicationDialog";
import { ProjectDialog } from "@/components/dialogs/ProjectDialog";
import { ChangePhaseDialog } from "@/components/actions/ChangePhaseDialog";
import { TaskToggleButton } from "@/components/actions/TaskToggleButton";
import { MarkPaymentPaidButton } from "@/components/actions/MarkPaymentPaidButton";
import { DeleteButton } from "@/components/actions/DeleteButton";
import { deleteProjectAction } from "@/lib/actions/projects";
import { deleteTaskAction } from "@/lib/actions/tasks";
import { deletePaymentAction } from "@/lib/actions/payments";
import { deleteMaintenanceAction } from "@/lib/actions/maintenances";
import { deleteProjectFileAction } from "@/lib/actions/project_files";
import { deleteDecisionAction } from "@/lib/actions/decisions";
import { deleteCommunicationAction } from "@/lib/actions/communications";
import {
  fetchAccounts,
  fetchClients,
  fetchProjects,
  fetchUsers,
  getClient,
  getProject,
  paymentsByProject,
  tasksByProject,
  projectFiles as projectFilesByProject,
  decisionsByProject,
  communicationsByProject,
  maintenancesByProject,
  fetchMaintenancePayments,
} from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { PHASES, type ProjectPhase } from "@/lib/types";

type Params = { id: string };

export default async function ProjectDetail({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return notFound();

  const [
    client,
    users,
    tasks,
    payments,
    files,
    projectDecisions,
    comms,
    projectMaints,
    allMaintPayments,
    accounts,
    clients,
    projects,
  ] = await Promise.all([
    getClient(project.client_id),
    fetchUsers(),
    tasksByProject(id),
    paymentsByProject(id),
    projectFilesByProject(id),
    decisionsByProject(id),
    communicationsByProject(id),
    maintenancesByProject(id),
    fetchMaintenancePayments(),
    fetchAccounts(),
    fetchClients(),
    fetchProjects(),
  ]);

  const userById = (uid: string | null | undefined) =>
    uid ? users.find((u) => u.id === uid) ?? null : null;
  const responsible = userById(project.responsible_user_id);
  const phaseLabel = (p: ProjectPhase) => PHASES.find((x) => x.key === p)?.label ?? p;

  const priorityTone: Record<string, "red" | "gold" | "cyan" | "muted"> = {
    urgente: "red",
    alta: "gold",
    media: "cyan",
    baja: "muted",
  };

  const monthLabel = (year: number, month: number) =>
    new Intl.DateTimeFormat("es-AR", { month: "short", year: "2-digit" }).format(
      new Date(year, month - 1, 1),
    );

  const projectId = project.id;

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
                {project.start_date ? formatDate(project.start_date) : "sin inicio"}
                {project.end_date && ` → ${formatDate(project.end_date)}`}
              </Pill>
              {responsible && <Pill tone="grow">{responsible.name}</Pill>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right">
              <div className="mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted)]">
                Total
              </div>
              <div className="display text-xl font-bold mt-1">
                {formatCurrency(project.total_amount, project.currency)}
              </div>
            </div>
            <ProjectDialog
              project={project}
              clients={clients}
              users={users}
              trigger={<Button variant="ghost">Editar</Button>}
            />
            <DeleteButton
              onConfirm={async () => {
                "use server";
                await deleteProjectAction(projectId);
              }}
              title="Eliminar proyecto"
              description={`Vas a eliminar “${project.name}” y todos sus datos asociados (tareas, pagos, archivos, decisiones, comunicaciones). Esta acción no se puede deshacer.`}
              confirmLabel="Sí, eliminar"
              trigger={<Button variant="ghost">Eliminar</Button>}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardTitle badge={<ChangePhaseDialog projectId={project.id} currentPhase={project.phase} />}>
          Fases
        </CardTitle>
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

      <Card padding={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="display text-[0.95rem] font-semibold">Tareas</h3>
          <TaskDialog
            projects={projects}
            users={users}
            defaultProjectId={project.id}
            trigger={<Button tone="ops">+ Nueva tarea</Button>}
          />
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
                <Th>Vence</Th>
                <Th>&nbsp;</Th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const u = userById(t.assigned_to);
                return (
                  <tr key={t.id} className="border-t border-[var(--color-border-1)]">
                    <td className="px-5 py-3 text-[0.85rem]">{t.title}</td>
                    <td className="px-5 py-3">
                      {u ? <Pill tone={u.color ?? "muted"}>{u.name}</Pill> : <span className="text-[var(--color-muted)] text-[0.75rem]">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={priorityTone[t.priority]}>{t.priority}</Pill>
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={t.status === "completada" ? "fin" : t.status === "en_progreso" ? "cyan" : "yellow"}>
                        {t.status.replace("_", " ")}
                      </Pill>
                    </td>
                    <td className="px-5 py-3 text-[0.8rem]">
                      {t.due_date ? formatDate(t.due_date) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <TaskToggleButton id={t.id} done={t.status === "completada"} />
                        <TaskDialog
                          projects={projects}
                          users={users}
                          task={t}
                          trigger={<Button variant="ghost">Editar</Button>}
                        />
                        <DeleteButton
                          onConfirm={async () => {
                            "use server";
                            await deleteTaskAction(t.id);
                          }}
                          title="Eliminar tarea"
                          description={`Vas a eliminar “${t.title}”.`}
                          trigger={<Button variant="ghost">Eliminar</Button>}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Card padding={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="display text-[0.95rem] font-semibold">Pagos</h3>
          <PaymentDialog
            projects={projects}
            defaultProjectId={project.id}
            trigger={<Button tone="fin">+ Registrar hito</Button>}
          />
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
                <Th>&nbsp;</Th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const u = userById(p.collected_by);
                const fecha = p.paid_at ?? p.due_date;
                return (
                  <tr key={p.id} className="border-t border-[var(--color-border-1)]">
                    <td className="px-5 py-3 text-[0.85rem]">{p.description}</td>
                    <td className="px-5 py-3 mono text-[0.8rem]">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="px-5 py-3 text-[0.8rem]">{fecha ? formatDate(fecha) : "—"}</td>
                    <td className="px-5 py-3">
                      <Pill tone={p.status === "cobrado" ? "fin" : p.status === "vencido" ? "red" : "yellow"}>
                        {p.status}
                      </Pill>
                    </td>
                    <td className="px-5 py-3">
                      {u ? <Pill tone={u.color ?? "muted"}>{u.name}</Pill> : <span className="text-[var(--color-muted)] text-[0.75rem]">—</span>}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {p.status !== "cobrado" && (
                          <MarkPaymentPaidButton id={p.id} accounts={accounts} />
                        )}
                        <PaymentDialog
                          projects={projects}
                          payment={p}
                          trigger={<Button variant="ghost">Editar</Button>}
                        />
                        <DeleteButton
                          onConfirm={async () => {
                            "use server";
                            await deletePaymentAction(p.id);
                          }}
                          title="Eliminar cobro"
                          description={`Vas a eliminar “${p.description}”.`}
                          trigger={<Button variant="ghost">Eliminar</Button>}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {project.phase === "soporte" && (
        <Card padding={false}>
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="display text-[0.95rem] font-semibold">Mantenimiento mensual</h3>
            <MaintenanceDialog
              clients={clients}
              projects={projects}
              defaultClientId={project.client_id}
              defaultProjectId={project.id}
              trigger={<Button tone="fin">+ Nuevo mantenimiento</Button>}
            />
          </div>
          {projectMaints.length === 0 ? (
            <div className="px-5 pb-5 text-[0.8rem] text-[var(--color-muted)]">Sin contratos.</div>
          ) : (
            <div className="border-t border-[var(--color-border-1)]">
              {projectMaints.map((m) => {
                const mpayments = allMaintPayments.filter((mp) => mp.maintenance_id === m.id);
                return (
                  <div key={m.id} className="px-5 py-4 border-b border-[var(--color-border-1)] last:border-b-0">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="display font-semibold text-[0.88rem]">{m.description}</div>
                        <div className="text-[0.72rem] text-[var(--color-muted)]">
                          {formatCurrency(m.amount, m.currency)} · día {m.day_of_month} de cada mes
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MaintenanceDialog
                          clients={clients}
                          projects={projects}
                          maintenance={m}
                          trigger={<Button variant="ghost">Editar</Button>}
                        />
                        <DeleteButton
                          onConfirm={async () => {
                            "use server";
                            await deleteMaintenanceAction(m.id);
                          }}
                          title="Eliminar mantenimiento"
                          description={`Vas a dar de baja el mantenimiento “${m.description}”.`}
                          trigger={<Button variant="ghost">Eliminar</Button>}
                        />
                      </div>
                    </div>
                    {mpayments.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {mpayments.map((p) => (
                          <Pill key={p.id} tone={p.status === "cobrado" ? "fin" : "yellow"}>
                            {monthLabel(p.period_year, p.period_month)} · {p.status}
                          </Pill>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle
            badge={
              <ProjectFileDialog
                projectId={project.id}
                trigger={<Button variant="ghost">+ Link</Button>}
              />
            }
          >
            Archivos y links
          </CardTitle>
          {files.length === 0 ? (
            <div className="text-[0.8rem] text-[var(--color-muted)]">Sin archivos.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-[7px] border border-[var(--color-border-1)] hover:border-[var(--color-ops-line)] transition-colors"
                >
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-0"
                  >
                    <div className="display font-semibold text-[0.82rem]">{f.name}</div>
                    <div className="text-[0.68rem] text-[var(--color-muted)] truncate">
                      {f.url}
                    </div>
                  </a>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Pill tone="ops">{f.type}</Pill>
                    <ProjectFileDialog
                      projectId={project.id}
                      file={f}
                      trigger={<Button variant="ghost">Editar</Button>}
                    />
                    <DeleteButton
                      onConfirm={async () => {
                        "use server";
                        await deleteProjectFileAction(f.id, projectId);
                      }}
                      title="Eliminar link"
                      description={`Vas a eliminar “${f.name}”.`}
                      trigger={<Button variant="ghost">Eliminar</Button>}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle
            badge={
              <DecisionDialog
                projectId={project.id}
                trigger={<Button variant="ghost">+ Decisión</Button>}
              />
            }
          >
            Log de decisiones
          </CardTitle>
          {projectDecisions.length === 0 ? (
            <div className="text-[0.8rem] text-[var(--color-muted)]">Sin decisiones registradas.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {projectDecisions.map((d) => {
                const u = userById(d.decided_by);
                return (
                  <div
                    key={d.id}
                    className="py-2.5 px-3 rounded-[7px] border border-[var(--color-border-1)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="display font-semibold text-[0.85rem]">{d.title}</div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {u && <Pill tone={u.color ?? "muted"}>{u.name}</Pill>}
                        <DecisionDialog
                          projectId={project.id}
                          decision={d}
                          trigger={<Button variant="ghost">Editar</Button>}
                        />
                        <DeleteButton
                          onConfirm={async () => {
                            "use server";
                            await deleteDecisionAction(d.id, projectId);
                          }}
                          title="Eliminar decisión"
                          description={`Vas a eliminar “${d.title}”.`}
                          trigger={<Button variant="ghost">Eliminar</Button>}
                        />
                      </div>
                    </div>
                    {d.description && (
                      <div className="text-[0.75rem] text-[var(--color-muted)] mt-1">
                        {d.description}
                      </div>
                    )}
                    <div className="mono text-[0.65rem] text-[var(--color-muted)] mt-1">
                      {formatDate(d.decided_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle
            badge={
              <CommunicationDialog
                projectId={project.id}
                clientId={project.client_id}
                trigger={<Button variant="ghost">+ Contacto</Button>}
              />
            }
          >
            Comunicaciones
          </CardTitle>
          {comms.length === 0 ? (
            <div className="text-[0.8rem] text-[var(--color-muted)]">Sin comunicaciones.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {comms.map((c) => {
                const u = userById(c.contacted_by);
                return (
                  <div
                    key={c.id}
                    className="py-2.5 px-3 rounded-[7px] border border-[var(--color-border-1)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="display font-semibold text-[0.85rem]">{c.subject ?? c.type}</div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Pill tone="cyan">{c.type}</Pill>
                        <CommunicationDialog
                          projectId={project.id}
                          clientId={project.client_id}
                          communication={c}
                          trigger={<Button variant="ghost">Editar</Button>}
                        />
                        <DeleteButton
                          onConfirm={async () => {
                            "use server";
                            await deleteCommunicationAction(c.id, projectId);
                          }}
                          title="Eliminar comunicación"
                          description={`Vas a eliminar “${c.subject ?? c.type}”.`}
                          trigger={<Button variant="ghost">Eliminar</Button>}
                        />
                      </div>
                    </div>
                    {c.content && (
                      <div className="text-[0.75rem] text-[var(--color-muted)] mt-1">{c.content}</div>
                    )}
                    <div className="mono text-[0.65rem] text-[var(--color-muted)] mt-1">
                      {u?.name ?? ""} · {formatDate(c.contacted_at)}
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

import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { TaskDialog } from "@/components/dialogs/TaskDialog";
import { TaskToggleButton } from "@/components/actions/TaskToggleButton";
import {
  fetchCurrentUser,
  fetchProjects,
  fetchUsers,
  tasksAssignedTo,
} from "@/lib/queries";
import { formatDate, daysUntil, relativeDays } from "@/lib/format";

export default async function TareasPage() {
  const me = await fetchCurrentUser();
  if (!me) return null;

  const [tasks, projects, users] = await Promise.all([
    tasksAssignedTo(me.id),
    fetchProjects(),
    fetchUsers(),
  ]);

  const getProject = (id: string) => projects.find((p) => p.id === id);
  const getUser = (id: string | null | undefined) => (id ? users.find((u) => u.id === id) : null);

  const priorityTone: Record<string, "red" | "gold" | "cyan" | "muted"> = {
    urgente: "red",
    alta: "gold",
    media: "cyan",
    baja: "muted",
  };

  const pending = tasks.filter((t) => t.status !== "completada");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Op 05">Mis tareas</SectionTitle>
        <TaskDialog
          projects={projects}
          users={users}
          trigger={<Button tone="ops">+ Nueva tarea</Button>}
        />
      </div>

      <Card padding={false}>
        {pending.length === 0 ? (
          <div className="py-16 text-center">
            <div className="display font-semibold">Todo al día</div>
            <div className="text-[0.8rem] text-[var(--color-muted)] mt-1">
              No tenés tareas pendientes.
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <Th>Título</Th>
                <Th>Proyecto</Th>
                <Th>Prioridad</Th>
                <Th>Estado</Th>
                <Th>Vence</Th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {pending.map((t) => {
                const proj = getProject(t.project_id);
                const u = getUser(t.assigned_to);
                const d = t.due_date ? daysUntil(t.due_date) : 0;
                return (
                  <tr key={t.id} className="border-t border-[var(--color-border-1)] hover:bg-[var(--color-surface-2)]">
                    <td className="px-5 py-3">
                      <div className="display font-semibold text-[0.88rem]">{t.title}</div>
                      {u && u.id !== me.id && (
                        <div className="text-[0.68rem] text-[var(--color-muted)]">
                          Asignada a {u.name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/proyectos/${t.project_id}`}
                        className="text-[0.82rem] hover:text-[var(--color-ops)]"
                      >
                        {proj?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={priorityTone[t.priority]}>{t.priority}</Pill>
                    </td>
                    <td className="px-5 py-3">
                      <Pill tone={t.status === "en_progreso" ? "cyan" : "yellow"}>
                        {t.status.replace("_", " ")}
                      </Pill>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-[0.8rem]">{t.due_date ? formatDate(t.due_date) : "—"}</div>
                      {t.due_date && (
                        <div className={`mono text-[0.66rem] ${d < 0 ? "text-[#A6352C]" : "text-[var(--color-muted)]"}`}>
                          {relativeDays(d)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <TaskToggleButton id={t.id} done={false} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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

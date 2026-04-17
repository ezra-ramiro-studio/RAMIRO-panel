import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { myTasks, getProject, getUser } from "@/lib/queries";
import { currentUser } from "@/lib/mock";
import { formatDate, daysUntil, relativeDays } from "@/lib/format";

export default function TareasPage() {
  const tasks = myTasks();

  const priorityTone: Record<string, "red" | "gold" | "cyan" | "muted"> = {
    urgente: "red",
    alta: "gold",
    media: "cyan",
    baja: "muted",
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Op 05">Mis tareas</SectionTitle>
        <div className="flex gap-2">
          <Button variant="ghost">Ver tareas de {currentUser.id === "u-ezra" ? "Marcos" : "Ezra"}</Button>
          <Button tone="ops">+ Nueva tarea</Button>
        </div>
      </div>

      <Card padding={false}>
        {tasks.length === 0 ? (
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
                <th className="mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted)] font-medium px-5 py-3">Título</th>
                <th className="mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted)] font-medium px-5 py-3">Proyecto</th>
                <th className="mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted)] font-medium px-5 py-3">Prioridad</th>
                <th className="mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted)] font-medium px-5 py-3">Estado</th>
                <th className="mono text-[0.62rem] uppercase tracking-wider text-[var(--color-muted)] font-medium px-5 py-3">Vence</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const proj = getProject(t.project_id);
                const u = getUser(t.assigned_to);
                const d = daysUntil(t.due_date);
                return (
                  <tr key={t.id} className="border-t border-[var(--color-border-1)] hover:bg-[var(--color-surface-2)]">
                    <td className="px-5 py-3">
                      <div className="display font-semibold text-[0.88rem]">{t.title}</div>
                      {u?.name !== currentUser.name && (
                        <div className="text-[0.68rem] text-[var(--color-muted)]">
                          Asignada a {u?.name}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/proyectos/${t.project_id}`}
                        className="text-[0.82rem] hover:text-[var(--color-ops)]"
                      >
                        {proj?.name}
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
                      <div className="text-[0.8rem]">{formatDate(t.due_date)}</div>
                      <div className={`mono text-[0.66rem] ${d < 0 ? "text-[#A6352C]" : "text-[var(--color-muted)]"}`}>
                        {relativeDays(d)}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost">✓ Completar</Button>
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

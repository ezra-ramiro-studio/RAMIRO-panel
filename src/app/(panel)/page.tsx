import Link from "next/link";
import { Card, CardTitle, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  fetchCurrentUser,
  fetchProjects,
  fetchUsers,
  todayTasks,
  upcomingCollections,
  monthlyMaintenances,
  treasuryTotals,
  expiringExpenses,
  recentActivity,
} from "@/lib/queries";
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  formatDateTime,
  daysUntil,
  relativeDays,
} from "@/lib/format";

export default async function HomePage() {
  const me = await fetchCurrentUser();
  if (!me) return null;

  const [tasks, collections, monthly, totals, activity, expiring, projects, users] =
    await Promise.all([
      todayTasks(me.id),
      upcomingCollections(7),
      monthlyMaintenances(new Date().toISOString().slice(0, 7)),
      treasuryTotals(),
      recentActivity(5),
      expiringExpenses(14),
      fetchProjects(),
      fetchUsers(),
    ]);

  const getProject = (id: string) => projects.find((p) => p.id === id);
  const getUser = (id: string | null) => (id ? users.find((u) => u.id === id) : null);

  const priorityTone: Record<string, "red" | "gold" | "cyan" | "muted"> = {
    urgente: "red",
    alta: "gold",
    media: "cyan",
    baja: "muted",
  };

  const todayLabel = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="flex flex-col gap-8">
      <div>
        <SectionTitle
          kicker={`Op 01 · Hola ${me.name}`}
          italicTail={todayLabel}
        >
          Hoy —
        </SectionTitle>
        <div className="flex items-center gap-2 mt-4">
          <Pill tone="ops">PERSONALIZADO</Pill>
          <Pill tone="muted">TIEMPO REAL</Pill>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle badge={<Pill tone="ops">{tasks.length} hoy</Pill>}>Mis tareas</CardTitle>
          {tasks.length === 0 ? (
            <EmptyState title="Día libre" description="No tenés tareas vencidas ni para hoy." />
          ) : (
            <div className="flex flex-col divide-y divide-[var(--color-border-1)]">
              {tasks.map((t) => {
                const proj = getProject(t.project_id);
                const d = t.due_date ? daysUntil(t.due_date) : 0;
                return (
                  <Link
                    key={t.id}
                    href={`/proyectos/${t.project_id}`}
                    className="flex items-center justify-between py-3 group"
                  >
                    <div className="min-w-0">
                      <div className="display font-semibold text-[0.88rem] group-hover:text-[var(--color-ops)] transition-colors">
                        {t.title}
                      </div>
                      <div className="text-[0.72rem] text-[var(--color-muted)] truncate">
                        {proj?.name} · {t.due_date ? relativeDays(d) : "sin fecha"}
                      </div>
                    </div>
                    <Pill tone={priorityTone[t.priority]}>{t.priority}</Pill>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle badge={<Pill tone="fin">{collections.length} cobros</Pill>}>
            Cobros pendientes (7 días)
          </CardTitle>
          {collections.length === 0 ? (
            <EmptyState title="Sin cobros inminentes" description="Todo tranquilo esta semana." />
          ) : (
            <div className="flex flex-col divide-y divide-[var(--color-border-1)]">
              {collections.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="display font-semibold text-[0.88rem]">{c.client}</div>
                    <div className="text-[0.72rem] text-[var(--color-muted)] truncate">
                      {c.description} · {formatShortDate(c.date)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Pill tone={c.type === "mantenimiento" ? "cyan" : "fin"}>{c.type}</Pill>
                    <div className="mono text-[0.82rem] font-semibold" style={{ color: "#4A7A3E" }}>
                      {formatCurrency(c.amount, c.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Mantenimientos del mes</CardTitle>
          {monthly.length === 0 ? (
            <EmptyState title="Sin mantenimientos" />
          ) : (
            <div className="flex flex-col gap-2">
              {monthly.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-2 px-3 rounded-[7px] border border-[var(--color-border-1)]"
                >
                  <div>
                    <div className="display font-semibold text-[0.85rem]">{m.client}</div>
                    <div className="text-[0.7rem] text-[var(--color-muted)]">{m.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="mono text-[0.78rem]">{formatCurrency(m.amount, m.currency)}</div>
                    <Pill tone={m.status === "cobrado" ? "fin" : "yellow"}>{m.status}</Pill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Tesorería</CardTitle>
          <div className="grid grid-cols-2 gap-6">
            <Stat
              label="Total ARS"
              tone="fin"
              value={formatCurrency(totals.ars, "ARS")}
              hint="Suma de cuentas en pesos"
            />
            <Stat
              label="Total USD"
              tone="fin"
              value={formatCurrency(totals.usd, "USD")}
              hint="Suma de cuentas en dólares"
            />
          </div>
          <div className="mt-5 pt-5 border-t border-[var(--color-border-1)]">
            <Link
              href="/tesoreria"
              className="inline-flex items-center gap-1 text-[0.75rem] hover:brightness-110"
              style={{ color: "#4A7A3E" }}
            >
              Ver desglose por cuenta →
            </Link>
          </div>
        </Card>

        <Card>
          <CardTitle badge={<Pill tone="muted" mono>ÚLTIMAS 5</Pill>}>Actividad reciente</CardTitle>
          {activity.length === 0 ? (
            <EmptyState title="Sin actividad reciente" />
          ) : (
            <div className="flex flex-col gap-3">
              {activity.map((a) => {
                const u = getUser(a.user_id);
                return (
                  <div key={a.id} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0"
                      style={{
                        background:
                          u?.color === "ops"
                            ? "rgba(107,31,43,0.15)"
                            : "rgba(196,122,62,0.15)",
                      }}
                    >
                      {u?.avatar_emoji ?? u?.name?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.8rem]">{a.description ?? `${a.action} ${a.entity_type}`}</div>
                      <div className="mono text-[0.66rem] text-[var(--color-muted)] mt-0.5">
                        {formatDateTime(a.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle badge={<Pill tone="yellow">14 días</Pill>}>Insumos por vencer</CardTitle>
          {expiring.length === 0 ? (
            <EmptyState title="Nada por vencer" />
          ) : (
            <div className="flex flex-col gap-2">
              {expiring.map((e) => {
                const d = daysUntil(e.next_due_date);
                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between py-2 px-3 rounded-[7px] border border-[var(--color-border-1)]"
                  >
                    <div>
                      <div className="display font-semibold text-[0.85rem]">{e.name}</div>
                      <div className="text-[0.7rem] text-[var(--color-muted)]">
                        {e.category} · {formatDate(e.next_due_date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="mono text-[0.78rem]">{formatCurrency(e.cost, e.currency)}</div>
                      <Pill tone={d <= 5 ? "red" : "yellow"}>{relativeDays(d)}</Pill>
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

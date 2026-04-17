import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { fetchAuditLog, fetchUsers } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";

export default async function AuditPage() {
  const [log, users] = await Promise.all([fetchAuditLog(200), fetchUsers()]);
  const items = [...log].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const getUser = (id: string | null | undefined) =>
    id ? users.find((u) => u.id === id) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Fin 05">Audit log</SectionTitle>
      </div>

      <Card padding={false}>
        {items.length === 0 ? (
          <div className="px-5 py-8 text-center text-[0.85rem] text-[var(--color-muted)]">
            Sin actividad registrada.
          </div>
        ) : (
          <div>
            {items.map((a) => {
              const u = getUser(a.user_id);
              const actionTone =
                a.action === "create" ? "fin" : a.action === "update" ? "ops" : "red";
              return (
                <div
                  key={a.id}
                  className="px-5 py-4 border-b border-[var(--color-border-1)] last:border-b-0 flex items-start gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0"
                    style={{
                      background:
                        u?.color === "ops" ? "rgba(107,31,43,0.15)" : "rgba(196,122,62,0.15)",
                    }}
                  >
                    {u?.avatar_emoji ?? u?.name?.[0] ?? "·"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="display font-semibold text-[0.85rem]">{u?.name ?? "—"}</span>
                      <Pill tone={actionTone as "fin" | "ops" | "red"}>{a.action}</Pill>
                      <Pill tone="muted" mono>{a.entity_type}</Pill>
                      <span className="mono text-[0.66rem] text-[var(--color-muted)] ml-auto">
                        {formatDateTime(a.created_at)}
                      </span>
                    </div>
                    {a.description && (
                      <div className="text-[0.82rem] mt-1.5">{a.description}</div>
                    )}
                    {(a.old_value || a.new_value) && (
                      <div className="mt-2 flex items-center gap-2 mono text-[0.7rem] flex-wrap">
                        {a.old_value && (
                          <span className="px-2 py-0.5 rounded border border-[var(--color-border-2)] text-[var(--color-muted)]">
                            {JSON.stringify(a.old_value)}
                          </span>
                        )}
                        {a.old_value && a.new_value && <span className="text-[var(--color-muted)]">→</span>}
                        {a.new_value && (
                          <span
                            className="px-2 py-0.5 rounded border"
                            style={{ borderColor: "rgba(74,122,62,0.4)", color: "#4A7A3E" }}
                          >
                            {JSON.stringify(a.new_value)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { fetchAuditLog, fetchUsers } from "@/lib/queries";
import { formatDate, formatDateTime } from "@/lib/format";

const FIELD_LABELS: Record<string, string> = {
  name: "Nombre",
  cost: "Costo",
  amount: "Monto",
  category: "Categoría",
  currency: "Moneda",
  frequency: "Frecuencia",
  is_active: "Activo",
  next_due_date: "Próximo vencimiento",
  due_date: "Vencimiento",
  project_id: "Proyecto",
  client_id: "Cliente",
  status: "Estado",
  phase: "Fase",
  priority: "Prioridad",
  title: "Título",
  description: "Descripción",
  notes: "Notas",
  email: "Email",
  phone: "Teléfono",
  role: "Rol",
  paid_at: "Pagado el",
  start_date: "Inicio",
  end_date: "Fin",
  budget: "Presupuesto",
};

const HIDDEN_FIELDS = new Set(["id", "created_at", "updated_at"]);

const ENTITY_LABELS: Record<string, string> = {
  expenses: "gasto",
  clients: "cliente",
  projects: "proyecto",
  tasks: "tarea",
  invoices: "factura",
  payments: "pago",
  contacts: "contacto",
  milestones: "hito",
};

function labelFor(key: string) {
  return FIELD_LABELS[key] ?? key.replace(/_/g, " ");
}

function entityLabel(entity: string) {
  return ENTITY_LABELS[entity] ?? entity;
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(value)) {
      try {
        return value.includes("T") ? formatDateTime(value) : formatDate(value);
      } catch {
        return value;
      }
    }
    return value;
  }
  return JSON.stringify(value);
}

type FieldDiff = { key: string; label: string; from: string; to: string };

function diffValues(
  oldVal: Record<string, unknown> | null | undefined,
  newVal: Record<string, unknown> | null | undefined,
): FieldDiff[] {
  const keys = new Set<string>();
  if (oldVal) Object.keys(oldVal).forEach((k) => keys.add(k));
  if (newVal) Object.keys(newVal).forEach((k) => keys.add(k));
  const diffs: FieldDiff[] = [];
  for (const key of keys) {
    if (HIDDEN_FIELDS.has(key)) continue;
    const o = oldVal?.[key];
    const n = newVal?.[key];
    if (JSON.stringify(o) === JSON.stringify(n)) continue;
    diffs.push({
      key,
      label: labelFor(key),
      from: formatValue(key, o),
      to: formatValue(key, n),
    });
  }
  return diffs;
}

function snapshotFields(
  value: Record<string, unknown> | null | undefined,
): FieldDiff[] {
  if (!value) return [];
  return Object.entries(value)
    .filter(([k, v]) => !HIDDEN_FIELDS.has(k) && v !== null && v !== "")
    .map(([k, v]) => ({
      key: k,
      label: labelFor(k),
      from: "",
      to: formatValue(k, v),
    }));
}

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
              const actionVerb =
                a.action === "create" ? "creó" : a.action === "update" ? "actualizó" : "eliminó";
              const entityName =
                (a.new_value?.name as string | undefined) ??
                (a.old_value?.name as string | undefined) ??
                (a.new_value?.title as string | undefined) ??
                (a.old_value?.title as string | undefined);
              const summary = `${u?.name ?? "Alguien"} ${actionVerb} ${entityLabel(a.entity_type)}${entityName ? ` "${entityName}"` : ""}`;

              const changes =
                a.action === "update"
                  ? diffValues(a.old_value, a.new_value)
                  : a.action === "create"
                    ? snapshotFields(a.new_value)
                    : snapshotFields(a.old_value);

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
                    <div className="text-[0.82rem] mt-1.5">{a.description || summary}</div>
                    {changes.length > 0 && (
                      <ul className="mt-2 flex flex-col gap-1 text-[0.78rem]">
                        {changes.map((c) => (
                          <li key={c.key} className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-[var(--color-muted)] uppercase tracking-[0.08em] text-[0.66rem] mono">
                              {c.label}
                            </span>
                            {a.action === "update" ? (
                              <>
                                <span className="line-through text-[var(--color-muted)]">{c.from}</span>
                                <span className="text-[var(--color-muted)]">→</span>
                                <span style={{ color: "#4A7A3E" }} className="font-medium">
                                  {c.to}
                                </span>
                              </>
                            ) : (
                              <span
                                style={{ color: a.action === "delete" ? "#A6352C" : "#4A7A3E" }}
                                className="font-medium"
                              >
                                {c.to}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
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

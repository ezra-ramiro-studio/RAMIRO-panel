import Link from "next/link";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { ProjectDialog } from "@/components/dialogs/ProjectDialog";
import {
  fetchClients,
  fetchProjects,
  fetchUsers,
} from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { PHASES, type ProjectPhase } from "@/lib/types";

type SearchParams = Promise<{
  q?: string;
  client?: string;
  phase?: string;
  status?: string;
  responsible?: string;
}>;

export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    q = "",
    client = "todos",
    phase = "todas",
    status = "todos",
    responsible = "todos",
  } = await searchParams;

  const [projects, clients, users] = await Promise.all([
    fetchProjects(),
    fetchClients(),
    fetchUsers(),
  ]);

  const clientById = new Map(clients.map((c) => [c.id, c]));
  const userById = new Map(users.map((u) => [u.id, u]));
  const phaseLabel = (p: ProjectPhase) =>
    PHASES.find((x) => x.key === p)?.label ?? p;

  const normalized = q.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    if (client !== "todos" && p.client_id !== client) return false;
    if (phase !== "todas" && p.phase !== phase) return false;
    if (status !== "todos" && p.status !== status) return false;
    if (responsible !== "todos") {
      if (responsible === "sin_asignar") {
        if (p.responsible_user_id) return false;
      } else if (p.responsible_user_id !== responsible) {
        return false;
      }
    }
    if (normalized) {
      const c = clientById.get(p.client_id);
      const haystack = `${p.name} ${p.description ?? ""} ${c?.name ?? ""}`
        .toLowerCase();
      if (!haystack.includes(normalized)) return false;
    }
    return true;
  });

  const activeCount = filtered.filter((p) => p.status === "activo").length;
  const totalArs = filtered
    .filter((p) => p.currency === "ARS")
    .reduce((s, p) => s + p.total_amount, 0);
  const totalUsd = filtered
    .filter((p) => p.currency === "USD")
    .reduce((s, p) => s + p.total_amount, 0);

  const hasFilters =
    q !== "" ||
    client !== "todos" ||
    phase !== "todas" ||
    status !== "todos" ||
    responsible !== "todos";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionTitle kicker="Op 03" italicTail="proyectos">
          Panel
        </SectionTitle>
        <ProjectDialog
          clients={clients}
          users={users}
          trigger={<Button tone="ops">+ Nuevo proyecto</Button>}
        />
      </div>

      <form className="flex items-end gap-3 flex-wrap" action="" method="get">
        <label className="flex flex-col gap-1">
          <span className="mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
            Buscar
          </span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Nombre, descripción o cliente"
            className="bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-[7px] px-3 py-1.5 text-[0.8rem] outline-none min-w-[220px]"
          />
        </label>
        <FilterSelect name="client" value={client} label="Cliente">
          <option value="todos">Todos</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="phase" value={phase} label="Fase">
          <option value="todas">Todas</option>
          {PHASES.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect name="status" value={status} label="Estado">
          <option value="todos">Todos</option>
          <option value="activo">Activo</option>
          <option value="pausado">Pausado</option>
          <option value="completado">Completado</option>
          <option value="archivado">Archivado</option>
        </FilterSelect>
        <FilterSelect name="responsible" value={responsible} label="Responsable">
          <option value="todos">Todos</option>
          <option value="sin_asignar">Sin asignar</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </FilterSelect>
        <Button type="submit" variant="ghost">
          Aplicar
        </Button>
        {hasFilters && (
          <Link
            href="/proyectos"
            className="mono text-[0.7rem] uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-burgundy)] pb-1.5"
          >
            limpiar
          </Link>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <Stat label="Proyectos" value={`${filtered.length}`} tone="ops" hint="Según filtros" />
        </Card>
        <Card>
          <Stat label="Activos" value={`${activeCount}`} tone="fin" />
        </Card>
        <Card>
          <Stat label="Total ARS" value={formatCurrency(totalArs, "ARS")} tone="neutral" />
        </Card>
        <Card>
          <Stat label="Total USD" value={formatCurrency(totalUsd, "USD")} tone="neutral" />
        </Card>
      </div>

      <Card padding={false}>
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-[0.85rem] text-[var(--color-muted)]">
            {hasFilters
              ? "No hay proyectos con estos filtros."
              : "Todavía no hay proyectos."}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left" style={{ background: "var(--color-surface-2)" }}>
                <Th>Proyecto</Th>
                <Th>Cliente</Th>
                <Th>Fase</Th>
                <Th>Estado</Th>
                <Th>Responsable</Th>
                <Th>Inicio</Th>
                <th className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold px-5 py-3 text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const c = clientById.get(p.client_id);
                const u = p.responsible_user_id
                  ? userById.get(p.responsible_user_id)
                  : null;
                const statusTone: "fin" | "yellow" | "muted" =
                  p.status === "activo"
                    ? "fin"
                    : p.status === "pausado"
                    ? "yellow"
                    : "muted";
                return (
                  <tr
                    key={p.id}
                    className="border-t border-[var(--color-border-1)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/proyectos/${p.id}`}
                        className="text-[14px] font-semibold hover:text-[var(--color-burgundy)] transition-colors"
                        style={{
                          fontFamily: "var(--font-syne)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {p.name}
                      </Link>
                      {p.description && (
                        <div className="text-[12px] text-[var(--color-muted)] mt-0.5 line-clamp-1">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[13px]">
                      {c ? (
                        <Link
                          href={`/clientes/${c.id}`}
                          className="hover:text-[var(--color-burgundy)] transition-colors"
                        >
                          {c.name}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Pill tone="ops">{phaseLabel(p.phase)}</Pill>
                    </td>
                    <td className="px-5 py-4">
                      <Pill tone={statusTone}>{p.status}</Pill>
                    </td>
                    <td className="px-5 py-4">
                      {u ? (
                        <Pill tone={u.color ?? "muted"}>{u.name}</Pill>
                      ) : (
                        <span className="text-[var(--color-muted)] text-[0.75rem]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[0.8rem]">
                      {p.start_date ? formatDate(p.start_date) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div
                        className="display text-[16px]"
                        style={{ color: "var(--color-burgundy)" }}
                      >
                        {formatCurrency(p.total_amount, p.currency)}
                      </div>
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
    <th className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-semibold px-5 py-3">
      {children}
    </th>
  );
}

function FilterSelect({
  name,
  value,
  label,
  children,
}: {
  name: string;
  value: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value}
        className="bg-[var(--color-surface)] border border-[var(--color-border-2)] rounded-[7px] px-3 py-1.5 text-[0.8rem] outline-none"
      >
        {children}
      </select>
    </label>
  );
}


import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { ExpenseDialog } from "@/components/dialogs/ExpenseDialog";
import { PayExpenseButton } from "@/components/actions/PayExpenseButton";
import { DeleteButton } from "@/components/actions/DeleteButton";
import { deleteExpenseAction } from "@/lib/actions/expenses";
import {
  fetchAccounts,
  fetchClients,
  fetchExpenses,
  fetchProjects,
} from "@/lib/queries";
import { formatCurrency, formatDate, daysUntil, relativeDays } from "@/lib/format";

export default async function InsumosPage() {
  const [expenses, projects, clients, accounts] = await Promise.all([
    fetchExpenses(),
    fetchProjects(),
    fetchClients(),
    fetchAccounts(),
  ]);

  const monthlyARS = expenses
    .filter((e) => e.frequency === "mensual" && e.currency === "ARS")
    .reduce((s, e) => s + e.cost, 0);
  const monthlyUSD = expenses
    .filter((e) => e.frequency === "mensual" && e.currency === "USD")
    .reduce((s, e) => s + e.cost, 0);

  const getProject = (id: string) => projects.find((p) => p.id === id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Fin 03">Insumos / egresos</SectionTitle>
        <ExpenseDialog
          projects={projects}
          clients={clients}
          trigger={<Button tone="fin">+ Nuevo insumo</Button>}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Stat label="Egresos mensuales ARS" tone="fin" value={formatCurrency(monthlyARS, "ARS")} />
        </Card>
        <Card>
          <Stat label="Egresos mensuales USD" tone="fin" value={formatCurrency(monthlyUSD, "USD")} />
        </Card>
        <Card>
          <Stat label="Total insumos" value={`${expenses.length}`} />
        </Card>
      </div>

      <Card padding={false}>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <Th>Nombre</Th>
              <Th>Categoría</Th>
              <Th>Costo</Th>
              <Th>Frecuencia</Th>
              <Th>Próximo vencimiento</Th>
              <Th>Imputado a</Th>
              <Th>&nbsp;</Th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => {
              const d = e.next_due_date ? daysUntil(e.next_due_date) : 9999;
              const tone = d <= 5 ? "red" : d <= 14 ? "yellow" : "muted";
              const proj = e.project_id ? getProject(e.project_id) : null;
              return (
                <tr key={e.id} className="border-t border-[var(--color-border-1)]">
                  <td className="px-5 py-3 display font-semibold text-[0.85rem]">{e.name}</td>
                  <td className="px-5 py-3 text-[0.82rem] text-[var(--color-muted)]">
                    {e.category ?? "—"}
                  </td>
                  <td className="px-5 py-3 mono text-[0.82rem]">
                    {formatCurrency(e.cost, e.currency)}
                  </td>
                  <td className="px-5 py-3">
                    <Pill tone="muted">{e.frequency}</Pill>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-[0.8rem]">
                      {e.next_due_date ? formatDate(e.next_due_date) : "—"}
                    </div>
                    {e.next_due_date && (
                      <div className="mono text-[0.62rem]" style={{ color: tone === "red" ? "#A6352C" : "#6b7fa0" }}>
                        {relativeDays(d)}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[0.8rem]">
                    {proj ? (
                      <Pill tone="ops">{proj.name}</Pill>
                    ) : (
                      <span className="text-[var(--color-muted)] text-[0.75rem]">Negocio</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <PayExpenseButton id={e.id} suggestedAmount={e.cost} accounts={accounts} />
                      <ExpenseDialog
                        projects={projects}
                        clients={clients}
                        expense={e}
                        trigger={<Button variant="ghost">Editar</Button>}
                      />
                      <DeleteButton
                        onConfirm={async () => {
                          "use server";
                          await deleteExpenseAction(e.id);
                        }}
                        title="Eliminar insumo"
                        description={`Vas a eliminar “${e.name}”. Esta acción no se puede deshacer.`}
                        trigger={<Button variant="ghost">Eliminar</Button>}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

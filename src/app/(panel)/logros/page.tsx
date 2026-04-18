import { Card, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { MilestoneDialog } from "@/components/dialogs/MilestoneDialog";
import { DeleteButton } from "@/components/actions/DeleteButton";
import { deleteMilestoneAction } from "@/lib/actions/milestones";
import { fetchMilestones, fetchUsers } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export default async function LogrosPage() {
  const [milestones, users] = await Promise.all([fetchMilestones(), fetchUsers()]);
  const items = [...milestones].sort((a, b) => b.milestone_date.localeCompare(a.milestone_date));
  const getUser = (id: string | null | undefined) =>
    id ? users.find((u) => u.id === id) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <SectionTitle kicker="Crec 04">Muro de logros</SectionTitle>
          <div className="text-[0.85rem] text-[var(--color-muted)] -mt-4">
            Los hitos que nos cuentan cómo va el emprendimiento.
          </div>
        </div>
        <MilestoneDialog trigger={<Button tone="grow">+ Registrar logro</Button>} />
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-[0.85rem] text-[var(--color-muted)]">
            Todavía no registraste logros. Registrá el primero con <strong>+ Registrar logro</strong>.
          </div>
        </Card>
      ) : (
        <div className="relative pl-10">
          <div
            className="absolute top-2 bottom-2 left-4 w-px"
            style={{ background: "rgba(196,122,62,0.25)" }}
          />
          <div className="flex flex-col gap-5">
            {items.map((m) => {
              const u = getUser(m.created_by);
              return (
                <div key={m.id} className="relative">
                  <div
                    className="absolute -left-[30px] top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      background: "#07090f",
                      borderColor: "#C47A3E",
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#C47A3E" }} />
                  </div>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="display font-bold text-[1.02rem]">{m.title}</h3>
                          {m.auto_generated && <Pill tone="grow" mono>AUTO</Pill>}
                        </div>
                        {m.description && (
                          <div className="text-[0.82rem] text-[var(--color-muted)] mt-1">
                            {m.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="mono text-[0.7rem]" style={{ color: "#C47A3E" }}>
                          {formatDate(m.milestone_date)}
                        </div>
                        {u && (
                          <div className="text-[0.7rem] text-[var(--color-muted)] mt-1">
                            por {u.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[var(--color-border-1)]">
                      <MilestoneDialog
                        milestone={m}
                        trigger={<Button variant="ghost">Editar</Button>}
                      />
                      <DeleteButton
                        onConfirm={async () => {
                          "use server";
                          await deleteMilestoneAction(m.id);
                        }}
                        title="Eliminar logro"
                        description={`Vas a eliminar “${m.title}”. Esta acción no se puede deshacer.`}
                        trigger={<Button variant="ghost">Eliminar</Button>}
                      />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

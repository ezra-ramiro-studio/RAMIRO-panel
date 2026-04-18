import { Card, CardTitle, SectionTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { UserDialog } from "@/components/dialogs/UserDialog";
import { AccountDialog } from "@/components/dialogs/AccountDialog";
import { BusinessSettingsDialog } from "@/components/dialogs/BusinessSettingsDialog";
import { DeleteButton } from "@/components/actions/DeleteButton";
import { deleteAccountAction } from "@/lib/actions/accounts";
import {
  fetchAccounts,
  fetchBusinessSettings,
  fetchUsers,
} from "@/lib/queries";

export default async function ConfiguracionPage() {
  const [users, accounts, business] = await Promise.all([
    fetchUsers(),
    fetchAccounts(),
    fetchBusinessSettings(),
  ]);

  const getUser = (id: string | null | undefined) =>
    id ? users.find((u) => u.id === id) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <SectionTitle kicker="Crec 03 · Admin">Configuración</SectionTitle>
      </div>

      <Card padding={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <CardTitle>Usuarios autorizados</CardTitle>
          <UserDialog trigger={<Button tone="grow">+ Agregar usuario</Button>} />
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <Th>Nombre</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
              <Th>Estado</Th>
              <Th>&nbsp;</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--color-border-1)]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                      style={{
                        background:
                          u.color === "ops" ? "rgba(107,31,43,0.15)" : "rgba(196,122,62,0.15)",
                      }}
                    >
                      {u.avatar_emoji ?? u.name[0]}
                    </div>
                    <span className="display font-semibold text-[0.88rem]">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 mono text-[0.78rem]">{u.email}</td>
                <td className="px-5 py-3">
                  <Pill tone={u.role === "admin" ? "grow" : "muted"}>{u.role}</Pill>
                </td>
                <td className="px-5 py-3">
                  <Pill tone={u.is_active ? "fin" : "red"}>{u.is_active ? "activo" : "inactivo"}</Pill>
                </td>
                <td className="px-5 py-3 text-right">
                  <UserDialog user={u} trigger={<Button variant="ghost">Editar</Button>} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card padding={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <CardTitle>Cuentas de tesorería</CardTitle>
          <AccountDialog users={users} trigger={<Button tone="grow">+ Agregar cuenta</Button>} />
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <Th>Nombre</Th>
              <Th>Propietario</Th>
              <Th>Tipo</Th>
              <Th>Moneda</Th>
              <Th>Estado</Th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t border-[var(--color-border-1)]">
                <td className="px-5 py-3 display font-semibold text-[0.85rem]">{a.name}</td>
                <td className="px-5 py-3 text-[0.8rem]">{getUser(a.owner_user_id)?.name ?? "—"}</td>
                <td className="px-5 py-3"><Pill tone="muted">{a.type.replace("_", " ")}</Pill></td>
                <td className="px-5 py-3"><Pill tone="ops">{a.currency}</Pill></td>
                <td className="px-5 py-3">
                  <Pill tone={a.is_active ? "fin" : "muted"}>
                    {a.is_active ? "activa" : "inactiva"}
                  </Pill>
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <AccountDialog
                      users={users}
                      account={a}
                      trigger={<Button variant="ghost">Editar</Button>}
                    />
                    {a.is_active && (
                      <DeleteButton
                        onConfirm={async () => {
                          "use server";
                          await deleteAccountAction(a.id);
                        }}
                        title="Desactivar cuenta"
                        description={`La cuenta “${a.name}” quedará inactiva. Las transacciones existentes se conservan.`}
                        confirmLabel="Desactivar"
                        trigger={<Button variant="ghost">Desactivar</Button>}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <CardTitle
          badge={
            <BusinessSettingsDialog
              settings={business}
              trigger={<Button variant="ghost">Editar</Button>}
            />
          }
        >
          Datos del negocio
        </CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[0.85rem]">
          <Field label="Nombre comercial" value={business?.name ?? "—"} />
          <Field label="Razón social" value={business?.razon_social ?? "—"} />
          <Field label="CUIT" value={business?.cuit ?? "—"} />
          <Field label="Dirección de facturación" value={business?.billing_address ?? "—"} />
        </div>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono text-[0.6rem] uppercase tracking-wider text-[var(--color-muted)] mb-1">
        {label}
      </div>
      <div>{value}</div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select } from "@/components/ui/Field";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import type { User } from "@/lib/types";

interface Props {
  trigger: React.ReactNode;
  user?: User;
}

export function UserDialog({ trigger, user }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const editing = Boolean(user);

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        if (user) await updateUserAction(user.id, formData);
        else await createUserAction(formData);
        toast.success("Guardado");
        setOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al guardar";
        setError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar usuario" : "Nuevo usuario"}>
        <form action={onSubmit}>
          <FormGrid>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required defaultValue={user?.email ?? ""} disabled={editing} />
            </div>
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required defaultValue={user?.name ?? ""} />
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select id="role" name="role" defaultValue={user?.role ?? "colaborador"}>
                <option value="admin">Admin</option>
                <option value="colaborador">Colaborador</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Select id="color" name="color" defaultValue={user?.color ?? ""}>
                <option value="">—</option>
                <option value="ops">ops</option>
                <option value="grow">grow</option>
              </Select>
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="avatar_emoji">Emoji</Label>
            <Input id="avatar_emoji" name="avatar_emoji" defaultValue={user?.avatar_emoji ?? ""} />
          </FormRow>
          {editing && (
            <FormRow>
              <Label htmlFor="is_active">Activo</Label>
              <Select id="is_active" name="is_active" defaultValue={user?.is_active ? "on" : ""}>
                <option value="on">Activo</option>
                <option value="">Inactivo</option>
              </Select>
            </FormRow>
          )}
          {error && <ErrorText>{error}</ErrorText>}
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" tone="primary" pending={pending}>{pending ? "Guardando…" : "Guardar"}</Button>
          </FormActions>
        </form>
      </Dialog>
    </>
  );
}

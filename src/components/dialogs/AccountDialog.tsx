"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select } from "@/components/ui/Field";
import { createAccountAction } from "@/lib/actions/accounts";
import type { User } from "@/lib/types";

interface Props {
  trigger: React.ReactNode;
  users: User[];
}

export function AccountDialog({ trigger, users }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await createAccountAction(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onClose={() => setOpen(false)} title="Nueva cuenta">
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select id="type" name="type" defaultValue="bank">
                <option value="bank">Banco</option>
                <option value="digital_wallet">Billetera digital</option>
                <option value="cash">Efectivo</option>
                <option value="crypto">Cripto</option>
                <option value="other">Otro</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select id="currency" name="currency" defaultValue="ARS">
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </Select>
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="owner_user_id">Propietario</Label>
            <Select id="owner_user_id" name="owner_user_id">
              <option value="">—</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </FormRow>
          {error && <ErrorText>{error}</ErrorText>}
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" tone="primary" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</Button>
          </FormActions>
        </form>
      </Dialog>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import type { Client } from "@/lib/types";
import { createClientAction, updateClientAction } from "@/lib/actions/clients";

interface Props {
  trigger: React.ReactNode;
  client?: Client;
}

export function ClientDialog({ trigger, client }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const editing = Boolean(client);

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        if (client) await updateClientAction(client.id, formData);
        else await createClientAction(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar cliente" : "Nuevo cliente"}
        description={editing ? "Actualizar datos del cliente." : "Registrar un cliente nuevo."}
      >
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required defaultValue={client?.name ?? ""} />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="industry">Industria</Label>
              <Input id="industry" name="industry" defaultValue={client?.industry ?? ""} />
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select id="status" name="status" defaultValue={client?.status ?? "activo"}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </Select>
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="contact_name">Contacto</Label>
              <Input id="contact_name" name="contact_name" defaultValue={client?.contact ?? ""} />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} />
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
            </div>
            <div>
              <Label htmlFor="preferred_currency">Moneda preferida</Label>
              <Select id="preferred_currency" name="preferred_currency" defaultValue={client?.preferred_currency ?? "ARS"}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </Select>
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" defaultValue={client?.notes ?? ""} />
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

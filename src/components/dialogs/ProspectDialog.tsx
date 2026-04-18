"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { createProspectAction, updateProspectAction } from "@/lib/actions/prospects";
import type { Prospect, User } from "@/lib/types";

interface Props {
  trigger: React.ReactNode;
  users: User[];
  prospect?: Prospect;
}

export function ProspectDialog({ trigger, users, prospect }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const editing = Boolean(prospect);

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        if (prospect) await updateProspectAction(prospect.id, formData);
        else await createProspectAction(formData);
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
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar prospecto" : "Nuevo prospecto"}>
        <form action={onSubmit}>
          <FormGrid>
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required defaultValue={prospect?.name ?? ""} />
            </div>
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input id="company" name="company" defaultValue={prospect?.company ?? ""} />
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="origin">Origen</Label>
              <Input
                id="origin"
                name="origin"
                placeholder="referido, sitio web…"
                defaultValue={prospect?.origin ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="stage">Etapa</Label>
              <Select id="stage" name="stage" defaultValue={prospect?.stage ?? "contacto_inicial"}>
                <option value="contacto_inicial">Contacto inicial</option>
                <option value="propuesta_enviada">Propuesta enviada</option>
                <option value="negociacion">Negociación</option>
                <option value="cerrado_ganado">Cerrado ganado</option>
                <option value="cerrado_perdido">Cerrado perdido</option>
              </Select>
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="estimated_amount">Monto estimado</Label>
              <Input
                id="estimated_amount"
                name="estimated_amount"
                type="number"
                step="0.01"
                defaultValue={prospect?.estimated_amount ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="estimated_currency">Moneda</Label>
              <Select
                id="estimated_currency"
                name="estimated_currency"
                defaultValue={prospect?.estimated_currency ?? "ARS"}
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </Select>
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="responsible_user_id">Responsable</Label>
            <Select
              id="responsible_user_id"
              name="responsible_user_id"
              defaultValue={prospect?.responsible_user_id ?? ""}
            >
              <option value="">—</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="next_step">Próximo paso</Label>
              <Input id="next_step" name="next_step" defaultValue={prospect?.next_step ?? ""} />
            </div>
            <div>
              <Label htmlFor="next_step_date">Fecha</Label>
              <Input
                id="next_step_date"
                name="next_step_date"
                type="date"
                defaultValue={prospect?.next_step_date ?? ""}
              />
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" defaultValue={prospect?.notes ?? ""} />
          </FormRow>
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

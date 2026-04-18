"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import type { Project } from "@/lib/types";
import { createPaymentAction } from "@/lib/actions/payments";

interface Props {
  trigger: React.ReactNode;
  projects: Project[];
  defaultProjectId?: string;
}

export function PaymentDialog({ trigger, projects, defaultProjectId }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await createPaymentAction(formData);
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
      <Dialog open={open} onClose={() => setOpen(false)} title="Nuevo cobro">
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="project_id">Proyecto</Label>
            <Select id="project_id" name="project_id" required defaultValue={defaultProjectId ?? ""}>
              <option value="">— Elegí un proyecto —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </FormRow>
          <FormRow>
            <Label htmlFor="description">Descripción</Label>
            <Input id="description" name="description" required />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="amount">Monto</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select id="currency" name="currency" defaultValue="ARS">
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </Select>
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="due_date">Vence</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select id="status" name="status" defaultValue="pendiente">
                <option value="pendiente">Pendiente</option>
                <option value="cobrado">Cobrado</option>
                <option value="vencido">Vencido</option>
              </Select>
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" name="notes" />
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

"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select } from "@/components/ui/Field";
import type { Client, Project } from "@/lib/types";
import { createExpenseAction } from "@/lib/actions/expenses";

interface Props {
  trigger: React.ReactNode;
  projects: Project[];
  clients: Client[];
}

export function ExpenseDialog({ trigger, projects, clients }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await createExpenseAction(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onClose={() => setOpen(false)} title="Nuevo insumo">
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Input id="category" name="category" />
            </div>
            <div>
              <Label htmlFor="frequency">Frecuencia</Label>
              <Select id="frequency" name="frequency" defaultValue="mensual">
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
                <option value="unico">Único</option>
              </Select>
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="cost">Costo</Label>
              <Input id="cost" name="cost" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select id="currency" name="currency" defaultValue="USD">
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </Select>
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="next_due_date">Próximo vencimiento</Label>
            <Input id="next_due_date" name="next_due_date" type="date" />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="project_id">Proyecto (opcional)</Label>
              <Select id="project_id" name="project_id">
                <option value="">— Negocio —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="client_id">Cliente (opcional)</Label>
              <Select id="client_id" name="client_id">
                <option value="">—</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
          </FormGrid>
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

"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { createMaintenanceAction } from "@/lib/actions/maintenances";
import type { Client, Project } from "@/lib/types";

interface Props {
  trigger: React.ReactNode;
  clients: Client[];
  projects: Project[];
  defaultClientId?: string;
  defaultProjectId?: string;
}

export function MaintenanceDialog({ trigger, clients, projects, defaultClientId, defaultProjectId }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await createMaintenanceAction(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onClose={() => setOpen(false)} title="Nuevo mantenimiento">
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="client_id">Cliente</Label>
            <Select id="client_id" name="client_id" required defaultValue={defaultClientId ?? ""}>
              <option value="">— Elegí un cliente —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormRow>
          <FormRow>
            <Label htmlFor="project_id">Proyecto (opcional)</Label>
            <Select id="project_id" name="project_id" defaultValue={defaultProjectId ?? ""}>
              <option value="">—</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </FormRow>
          <FormRow>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" required />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="amount">Valor mensual</Label>
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
          <FormRow>
            <Label htmlFor="day_of_month">Día de cobro</Label>
            <Input id="day_of_month" name="day_of_month" type="number" min="1" max="31" defaultValue="1" />
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

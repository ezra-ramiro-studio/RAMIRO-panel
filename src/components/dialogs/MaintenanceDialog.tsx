"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { createMaintenanceAction, updateMaintenanceAction } from "@/lib/actions/maintenances";
import type { Client, Maintenance, Project } from "@/lib/types";

interface Props {
  trigger: React.ReactNode;
  clients: Client[];
  projects: Project[];
  defaultClientId?: string;
  defaultProjectId?: string;
  maintenance?: Maintenance;
}

export function MaintenanceDialog({
  trigger,
  clients,
  projects,
  defaultClientId,
  defaultProjectId,
  maintenance,
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const editing = Boolean(maintenance);

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        if (maintenance) await updateMaintenanceAction(maintenance.id, formData);
        else await createMaintenanceAction(formData);
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
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar mantenimiento" : "Nuevo mantenimiento"}>
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="client_id">Cliente</Label>
            <Select
              id="client_id"
              name="client_id"
              required
              defaultValue={maintenance?.client_id ?? defaultClientId ?? ""}
            >
              <option value="">— Elegí un cliente —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormRow>
          <FormRow>
            <Label htmlFor="project_id">Proyecto (opcional)</Label>
            <Select
              id="project_id"
              name="project_id"
              defaultValue={maintenance?.project_id ?? defaultProjectId ?? ""}
            >
              <option value="">—</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </FormRow>
          <FormRow>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" required defaultValue={maintenance?.description ?? ""} />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="amount">Valor mensual</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                defaultValue={maintenance?.amount ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Select id="currency" name="currency" defaultValue={maintenance?.currency ?? "ARS"}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </Select>
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="day_of_month">Día de cobro</Label>
            <Input
              id="day_of_month"
              name="day_of_month"
              type="number"
              min="1"
              max="31"
              defaultValue={maintenance?.day_of_month ?? 1}
            />
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

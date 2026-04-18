"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import type { Client, Project, User } from "@/lib/types";
import { createProjectAction, updateProjectAction } from "@/lib/actions/projects";

interface Props {
  trigger: React.ReactNode;
  clients: Client[];
  users: User[];
  project?: Project;
  defaultClientId?: string;
}

export function ProjectDialog({ trigger, clients, users, project, defaultClientId }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const editing = Boolean(project);

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        if (project) await updateProjectAction(project.id, formData);
        else await createProjectAction(formData);
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
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar proyecto" : "Nuevo proyecto"}
      >
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required defaultValue={project?.name ?? ""} />
          </FormRow>
          {!editing && (
            <FormRow>
              <Label htmlFor="client_id">Cliente</Label>
              <Select id="client_id" name="client_id" required defaultValue={defaultClientId ?? ""}>
                <option value="">— Elegí un cliente —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormRow>
          )}
          <FormRow>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" defaultValue={project?.description ?? ""} />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select id="status" name="status" defaultValue={project?.status ?? "activo"}>
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="completado">Completado</option>
                <option value="archivado">Archivado</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="phase">Fase</Label>
              <Select id="phase" name="phase" defaultValue={project?.phase ?? "descubrimiento"} disabled={editing}>
                <option value="descubrimiento">Descubrimiento</option>
                <option value="diseno">Diseño</option>
                <option value="desarrollo">Desarrollo</option>
                <option value="entrega">Entrega</option>
                <option value="soporte">Soporte</option>
                <option value="archivado">Archivado</option>
              </Select>
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="start_date">Inicio</Label>
              <Input id="start_date" name="start_date" type="date" defaultValue={project?.start_date ?? ""} />
            </div>
            <div>
              <Label htmlFor="end_date">Fin</Label>
              <Input id="end_date" name="end_date" type="date" defaultValue={project?.end_date ?? ""} />
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="responsible_user_id">Responsable</Label>
              <Select id="responsible_user_id" name="responsible_user_id" defaultValue={project?.responsible_user_id ?? ""}>
                <option value="">—</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="total_amount">Monto total</Label>
              <Input id="total_amount" name="total_amount" type="number" step="0.01" defaultValue={project?.total_amount ?? 0} />
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="currency">Moneda</Label>
            <Select id="currency" name="currency" defaultValue={project?.currency ?? "ARS"}>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
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

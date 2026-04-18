"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import type { Project, User } from "@/lib/types";
import { createTaskAction } from "@/lib/actions/tasks";

interface Props {
  trigger: React.ReactNode;
  projects: Project[];
  users: User[];
  defaultProjectId?: string;
}

export function TaskDialog({ trigger, projects, users, defaultProjectId }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await createTaskAction(formData);
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
      <Dialog open={open} onClose={() => setOpen(false)} title="Nueva tarea">
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </FormRow>
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
            <Textarea id="description" name="description" />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="assigned_to">Asignado a</Label>
              <Select id="assigned_to" name="assigned_to">
                <option value="">—</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Prioridad</Label>
              <Select id="priority" name="priority" defaultValue="media">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </Select>
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select id="status" name="status" defaultValue="pendiente">
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="due_date">Vence</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
          </FormGrid>
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

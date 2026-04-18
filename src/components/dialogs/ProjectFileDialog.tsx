"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormRow, Input, Label, Select } from "@/components/ui/Field";
import type { ProjectFile } from "@/lib/types";
import { createProjectFileAction, updateProjectFileAction } from "@/lib/actions/project_files";

interface Props {
  trigger: React.ReactNode;
  projectId: string;
  file?: ProjectFile;
}

export function ProjectFileDialog({ trigger, projectId, file }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const editing = Boolean(file);

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        if (file) await updateProjectFileAction(file.id, formData);
        else await createProjectFileAction(formData);
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
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar archivo / link" : "Nuevo archivo / link"}>
        <form action={onSubmit}>
          <input type="hidden" name="project_id" value={projectId} />
          <FormRow>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required defaultValue={file?.name ?? ""} />
          </FormRow>
          <FormRow>
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" type="url" required defaultValue={file?.url ?? ""} />
          </FormRow>
          <FormRow>
            <Label htmlFor="type">Tipo</Label>
            <Select id="type" name="type" defaultValue={file?.type ?? "otro"}>
              <option value="figma">Figma</option>
              <option value="drive">Drive</option>
              <option value="repo">Repositorio</option>
              <option value="docs">Documento</option>
              <option value="otro">Otro</option>
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

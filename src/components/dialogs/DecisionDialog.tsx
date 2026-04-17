"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ErrorText, FormActions, FormRow, Input, Label, Textarea } from "@/components/ui/Field";
import { createDecisionAction } from "@/lib/actions/decisions";

interface Props {
  trigger: React.ReactNode;
  projectId: string;
}

export function DecisionDialog({ trigger, projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await createDecisionAction(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onClose={() => setOpen(false)} title="Nueva decisión">
        <form action={onSubmit}>
          <input type="hidden" name="project_id" value={projectId} />
          <FormRow>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </FormRow>
          <FormRow>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" />
          </FormRow>
          <FormRow>
            <Label htmlFor="decided_at">Fecha</Label>
            <Input id="decided_at" name="decided_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
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

"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Textarea } from "@/components/ui/Field";
import { createMilestoneAction } from "@/lib/actions/milestones";

interface Props {
  trigger: React.ReactNode;
}

export function MilestoneDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await createMilestoneAction(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onClose={() => setOpen(false)} title="Nuevo logro">
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </FormRow>
          <FormRow>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="milestone_date">Fecha</Label>
              <Input id="milestone_date" name="milestone_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div></div>
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

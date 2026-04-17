"use client";

import { useState, useTransition } from "react";
import { changePhaseAction } from "@/lib/actions/projects";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorText, FormActions, FormRow, Label, Select } from "@/components/ui/Field";
import { PHASES } from "@/lib/types";

interface Props {
  projectId: string;
  currentPhase: string;
}

export function ChangePhaseDialog({ projectId, currentPhase }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await changePhaseAction(projectId, formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cambiar fase");
      }
    });
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Cambiar fase</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Cambiar fase">
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="phase">Nueva fase</Label>
            <Select id="phase" name="phase" defaultValue={currentPhase}>
              {PHASES.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </Select>
          </FormRow>
          {error && <ErrorText>{error}</ErrorText>}
          <FormActions>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" tone="primary" disabled={pending}>{pending ? "Guardando…" : "Confirmar"}</Button>
          </FormActions>
        </form>
      </Dialog>
    </>
  );
}

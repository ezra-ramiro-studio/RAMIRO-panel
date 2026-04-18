"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import type { Communication } from "@/lib/types";
import { createCommunicationAction, updateCommunicationAction } from "@/lib/actions/communications";

interface Props {
  trigger: React.ReactNode;
  projectId: string;
  clientId: string;
  communication?: Communication;
}

export function CommunicationDialog({ trigger, projectId, clientId, communication }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const editing = Boolean(communication);

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        if (communication) await updateCommunicationAction(communication.id, formData);
        else await createCommunicationAction(formData);
        toast.success("Guardado");
        setOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al guardar";
        setError(msg);
        toast.error(msg);
      }
    });
  }

  const contactedAtDefault = communication?.contacted_at
    ? communication.contacted_at.slice(0, 10)
    : "";

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar comunicación" : "Nueva comunicación"}>
        <form action={onSubmit}>
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="client_id" value={clientId} />
          <FormRow>
            <Label htmlFor="type">Canal</Label>
            <Select id="type" name="type" defaultValue={communication?.type ?? "email"}>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="llamada">Llamada</option>
              <option value="reunion">Reunión</option>
              <option value="otro">Otro</option>
            </Select>
          </FormRow>
          <FormRow>
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" name="subject" defaultValue={communication?.subject ?? ""} />
          </FormRow>
          <FormRow>
            <Label htmlFor="content">Contenido</Label>
            <Textarea id="content" name="content" defaultValue={communication?.content ?? ""} />
          </FormRow>
          {editing && (
            <FormRow>
              <Label htmlFor="contacted_at">Fecha</Label>
              <Input id="contacted_at" name="contacted_at" type="date" defaultValue={contactedAtDefault} />
            </FormRow>
          )}
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

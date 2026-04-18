"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { createServiceAction, updateServiceAction } from "@/lib/actions/services";
import type { Service } from "@/lib/types";

interface Props {
  trigger: React.ReactNode;
  service?: Service;
}

export function ServiceDialog({ trigger, service }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const editing = Boolean(service);

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        if (service) await updateServiceAction(service.id, formData);
        else await createServiceAction(formData);
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
      <Dialog open={open} onClose={() => setOpen(false)} title={editing ? "Editar servicio" : "Nuevo servicio"}>
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required defaultValue={service?.name ?? ""} />
          </FormRow>
          <FormRow>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" defaultValue={service?.description ?? ""} />
          </FormRow>
          <FormGrid>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select id="type" name="type" defaultValue={service?.type ?? "proyecto"}>
                <option value="proyecto">Proyecto</option>
                <option value="mensual">Mensual</option>
                <option value="hora">Hora</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimated_delivery_days">Entrega (días)</Label>
              <Input
                id="estimated_delivery_days"
                name="estimated_delivery_days"
                type="number"
                defaultValue={service?.estimated_delivery_days ?? ""}
              />
            </div>
          </FormGrid>
          <FormGrid>
            <div>
              <Label htmlFor="price_ars">Precio ARS</Label>
              <Input
                id="price_ars"
                name="price_ars"
                type="number"
                step="0.01"
                defaultValue={service?.price_ars ?? 0}
              />
            </div>
            <div>
              <Label htmlFor="price_usd">Precio USD</Label>
              <Input
                id="price_usd"
                name="price_usd"
                type="number"
                step="0.01"
                defaultValue={service?.price_usd ?? 0}
              />
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

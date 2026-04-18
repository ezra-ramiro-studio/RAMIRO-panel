"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ErrorText, FormActions, FormGrid, FormRow, Input, Label, Textarea } from "@/components/ui/Field";
import { updateBusinessSettingsAction } from "@/lib/actions/business_settings";
import type { BusinessSettings } from "@/lib/types";

interface Props {
  trigger: React.ReactNode;
  settings: BusinessSettings | null;
}

export function BusinessSettingsDialog({ trigger, settings }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await updateBusinessSettingsAction(formData);
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
      <Dialog open={open} onClose={() => setOpen(false)} title="Datos del negocio">
        <form action={onSubmit}>
          <FormGrid>
            <div>
              <Label htmlFor="name">Nombre comercial</Label>
              <Input id="name" name="name" required defaultValue={settings?.name ?? ""} />
            </div>
            <div>
              <Label htmlFor="razon_social">Razón social</Label>
              <Input id="razon_social" name="razon_social" defaultValue={settings?.razon_social ?? ""} />
            </div>
          </FormGrid>
          <FormRow>
            <Label htmlFor="cuit">CUIT</Label>
            <Input id="cuit" name="cuit" defaultValue={settings?.cuit ?? ""} />
          </FormRow>
          <FormRow>
            <Label htmlFor="billing_address">Dirección de facturación</Label>
            <Textarea id="billing_address" name="billing_address" defaultValue={settings?.billing_address ?? ""} />
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

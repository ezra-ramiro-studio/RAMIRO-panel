"use client";

import { useState, useTransition } from "react";
import { markPaymentPaidAction } from "@/lib/actions/payments";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorText, FormActions, FormRow, Input, Label, Select } from "@/components/ui/Field";
import type { Account } from "@/lib/types";

interface Props {
  id: string;
  accounts: Account[];
}

export function MarkPaymentPaidButton({ id, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await markPaymentPaidAction(id, formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Cobrar</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Registrar cobro">
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor={`method-${id}`}>Método</Label>
            <Input id={`method-${id}`} name="payment_method" placeholder="transferencia, efectivo…" />
          </FormRow>
          <FormRow>
            <Label htmlFor={`account-${id}`}>Cuenta</Label>
            <Select id={`account-${id}`} name="account_id">
              <option value="">—</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
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

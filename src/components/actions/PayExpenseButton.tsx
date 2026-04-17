"use client";

import { useState, useTransition } from "react";
import { payExpenseAction } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorText, FormActions, FormRow, Input, Label, Select } from "@/components/ui/Field";
import type { Account } from "@/lib/types";

interface Props {
  id: string;
  suggestedAmount: number;
  accounts: Account[];
}

export function PayExpenseButton({ id, suggestedAmount, accounts }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      try {
        await payExpenseAction(id, formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Marcar pagado</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Registrar pago">
        <form action={onSubmit}>
          <FormRow>
            <Label htmlFor={`amount-${id}`}>Monto</Label>
            <Input id={`amount-${id}`} name="amount" type="number" step="0.01" defaultValue={suggestedAmount} />
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

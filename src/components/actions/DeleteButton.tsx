"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorText, FormActions } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";

interface Props {
  onConfirm: () => Promise<void>;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  trigger?: ReactNode;
}

export function DeleteButton({
  onConfirm,
  title = "Eliminar",
  description = "Esta acción no se puede deshacer.",
  confirmLabel = "Eliminar",
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();

  function onConfirmClick() {
    setError(null);
    start(async () => {
      try {
        await onConfirm();
        toast.success("Eliminado");
        setOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al eliminar";
        setError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? <Button tone="danger">Eliminar</Button>}
      </span>
      <Dialog
        open={open}
        onClose={() => (pending ? null : setOpen(false))}
        title={title}
        widthClass="max-w-[420px]"
      >
        <div className="text-[0.85rem] text-[var(--color-muted)] mb-4">
          {description}
        </div>
        {error && <ErrorText>{error}</ErrorText>}
        <FormActions>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            tone="danger"
            onClick={onConfirmClick}
            pending={pending}
          >
            {pending ? "Eliminando…" : confirmLabel}
          </Button>
        </FormActions>
      </Dialog>
    </>
  );
}

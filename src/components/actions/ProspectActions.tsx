"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorText, FormActions, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { DeleteButton } from "@/components/actions/DeleteButton";
import {
  changeProspectStageAction,
  convertProspectAction,
  deleteProspectAction,
} from "@/lib/actions/prospects";
import { PROSPECT_STAGES, type Prospect } from "@/lib/types";

interface Props {
  prospect: Prospect;
}

export function ProspectActions({ prospect }: Props) {
  const [pendingStage, startStage] = useTransition();
  const [pendingConvert, startConvert] = useTransition();
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const toast = useToast();
  const alreadyConverted = Boolean(prospect.converted_client_id);

  function onStageChange(value: string) {
    if (value === prospect.stage) return;
    startStage(async () => {
      try {
        await changeProspectStageAction(prospect.id, value);
        toast.success("Etapa actualizada");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error");
      }
    });
  }

  function onConvert() {
    setConvertError(null);
    startConvert(async () => {
      try {
        await convertProspectAction(prospect.id);
        toast.success("Convertido a cliente");
        setConvertOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al convertir";
        setConvertError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <div
      className="mt-3 flex items-center gap-1.5 flex-wrap"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="min-w-[140px]">
        <Select
          size="xs"
          value={prospect.stage}
          onChange={(e) => onStageChange(e.target.value)}
          disabled={pendingStage}
          aria-label="Etapa"
        >
          {PROSPECT_STAGES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </Select>
      </div>
      {!alreadyConverted && (
        <Button
          type="button"
          tone="fin"
          onClick={() => setConvertOpen(true)}
          className="!px-2 !py-1 !text-[0.6rem]"
        >
          Convertir
        </Button>
      )}
      <DeleteButton
        onConfirm={async () => {
          await deleteProspectAction(prospect.id);
        }}
        title="Eliminar prospecto"
        description={`Vas a eliminar “${prospect.name}”. Esta acción no se puede deshacer.`}
        trigger={
          <Button tone="danger" className="!px-2 !py-1 !text-[0.6rem]">
            Eliminar
          </Button>
        }
      />
      <Dialog
        open={convertOpen}
        onClose={() => (pendingConvert ? null : setConvertOpen(false))}
        title="Convertir en cliente"
        widthClass="max-w-[420px]"
      >
        <div className="text-[0.85rem] text-[var(--color-muted)] mb-4">
          Se creará un cliente nuevo con los datos de “{prospect.name}” y el prospecto quedará marcado como cerrado ganado.
        </div>
        {convertError && <ErrorText>{convertError}</ErrorText>}
        <FormActions>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConvertOpen(false)}
            disabled={pendingConvert}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            tone="fin"
            onClick={onConvert}
            pending={pendingConvert}
          >
            {pendingConvert ? "Convirtiendo…" : "Convertir"}
          </Button>
        </FormActions>
      </Dialog>
    </div>
  );
}

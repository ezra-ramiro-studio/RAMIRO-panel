"use server";

import { revalidatePath } from "next/cache";
import { fd, fdNum, getSessionUser } from "./_helpers";

export async function createProspectAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("prospects").insert({
    name: fd<string>(formData, "name"),
    company: fd<string | null>(formData, "company", null),
    origin: fd<string | null>(formData, "origin", null),
    stage: fd<string>(formData, "stage", "contacto_inicial"),
    responsible_user_id: fd<string | null>(formData, "responsible_user_id", null),
    estimated_amount: fdNum(formData, "estimated_amount"),
    estimated_currency: fd<string | null>(formData, "estimated_currency", null),
    next_step: fd<string | null>(formData, "next_step", null),
    next_step_date: fd<string | null>(formData, "next_step_date", null),
    notes: fd<string | null>(formData, "notes", null),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/prospectos");
  revalidatePath("/");
}

export async function updateProspectAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase
    .from("prospects")
    .update({
      name: fd<string>(formData, "name"),
      company: fd<string | null>(formData, "company", null),
      origin: fd<string | null>(formData, "origin", null),
      responsible_user_id: fd<string | null>(formData, "responsible_user_id", null),
      estimated_amount: fdNum(formData, "estimated_amount"),
      estimated_currency: fd<string | null>(formData, "estimated_currency", null),
      next_step: fd<string | null>(formData, "next_step", null),
      next_step_date: fd<string | null>(formData, "next_step_date", null),
      notes: fd<string | null>(formData, "notes", null),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/prospectos");
}

export async function changeProspectStageAction(id: string, stage: string) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("prospects").update({ stage }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/prospectos");
}

export async function convertProspectAction(id: string) {
  const { supabase } = await getSessionUser();
  const { data: p } = await supabase.from("prospects").select("*").eq("id", id).single();
  if (!p) throw new Error("Prospecto no encontrado");

  const { data: client, error: cErr } = await supabase
    .from("clients")
    .insert({
      name: p.company ?? p.name,
      contact_name: p.name,
      status: "activo",
      preferred_currency: p.estimated_currency ?? "ARS",
      notes: p.notes,
    })
    .select("id")
    .single();
  if (cErr) throw new Error(cErr.message);

  await supabase
    .from("prospects")
    .update({
      stage: "cerrado_ganado",
      converted_client_id: client.id,
      converted_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/prospectos");
  revalidatePath("/clientes");
}

export async function deleteProspectAction(id: string) {
  const { supabase } = await getSessionUser();
  await supabase.from("prospects").delete().eq("id", id);
  revalidatePath("/prospectos");
}

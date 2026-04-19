"use server";

import { revalidatePath } from "next/cache";
import { fd, fdNum, getSessionUser } from "./_helpers";

export async function createPaymentAction(formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const status = fd<string>(formData, "status", "pendiente");
  const { error } = await supabase.from("payments").insert({
    project_id: fd<string>(formData, "project_id"),
    description: fd<string>(formData, "description"),
    amount: fdNum(formData, "amount") ?? 0,
    currency: fd<string>(formData, "currency", "ARS"),
    due_date: fd<string | null>(formData, "due_date", null),
    status,
    account_id: fd<string | null>(formData, "account_id", null),
    notes: fd<string | null>(formData, "notes", null),
    ...(status === "cobrado"
      ? { paid_at: new Date().toISOString(), collected_by: dbUser.id }
      : {}),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/cobros");
  revalidatePath("/tesoreria");
  revalidatePath("/");
  const projectId = fd<string>(formData, "project_id");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function updatePaymentAction(id: string, formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const { data: prev } = await supabase
    .from("payments")
    .select("project_id, status, paid_at, collected_by")
    .eq("id", id)
    .single();
  const projectId = fd<string>(formData, "project_id", prev?.project_id ?? "");
  const status = fd<string>(formData, "status", "pendiente");
  const becameCobrado = status === "cobrado" && !prev?.paid_at;
  const leftCobrado = status !== "cobrado" && prev?.status === "cobrado";
  const { error } = await supabase
    .from("payments")
    .update({
      project_id: projectId,
      description: fd<string>(formData, "description"),
      amount: fdNum(formData, "amount") ?? 0,
      currency: fd<string>(formData, "currency", "ARS"),
      due_date: fd<string | null>(formData, "due_date", null),
      status,
      account_id: fd<string | null>(formData, "account_id", null),
      notes: fd<string | null>(formData, "notes", null),
      ...(becameCobrado
        ? {
            paid_at: new Date().toISOString(),
            collected_by: prev?.collected_by ?? dbUser.id,
          }
        : {}),
      ...(leftCobrado ? { paid_at: null } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/cobros");
  revalidatePath("/tesoreria");
  revalidatePath("/");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
  if (prev?.project_id && prev.project_id !== projectId) {
    revalidatePath(`/proyectos/${prev.project_id}`);
  }
}

export async function markPaymentPaidAction(id: string, formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const { data } = await supabase.from("payments").select("project_id").eq("id", id).single();
  const { error } = await supabase
    .from("payments")
    .update({
      status: "cobrado",
      paid_at: new Date().toISOString(),
      payment_method: fd<string | null>(formData, "payment_method", null),
      account_id: fd<string | null>(formData, "account_id", null),
      collected_by: dbUser.id,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/cobros");
  revalidatePath("/tesoreria");
  revalidatePath("/");
  if (data?.project_id) revalidatePath(`/proyectos/${data.project_id}`);
}

export async function deletePaymentAction(id: string) {
  const { supabase } = await getSessionUser();
  const { data } = await supabase.from("payments").select("project_id").eq("id", id).single();
  await supabase.from("payments").delete().eq("id", id);
  revalidatePath("/cobros");
  if (data?.project_id) revalidatePath(`/proyectos/${data.project_id}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { fd, fdNum, getSessionUser } from "./_helpers";

export async function createMaintenanceAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("maintenances").insert({
    client_id: fd<string>(formData, "client_id"),
    project_id: fd<string | null>(formData, "project_id", null),
    description: fd<string>(formData, "description"),
    amount: fdNum(formData, "amount") ?? 0,
    currency: fd<string>(formData, "currency", "ARS"),
    day_of_month: fdNum(formData, "day_of_month") ?? 1,
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/insumos");
  revalidatePath("/cobros");
  revalidatePath("/");
}

export async function updateMaintenanceAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase
    .from("maintenances")
    .update({
      description: fd<string>(formData, "description"),
      amount: fdNum(formData, "amount") ?? 0,
      currency: fd<string>(formData, "currency", "ARS"),
      day_of_month: fdNum(formData, "day_of_month") ?? 1,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/insumos");
  revalidatePath("/cobros");
}

export async function payMaintenanceAction(id: string, formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const { data: m } = await supabase
    .from("maintenances")
    .select("amount, currency")
    .eq("id", id)
    .single();
  if (!m) throw new Error("Mantenimiento no encontrado");

  const now = new Date();
  const period_month = fdNum(formData, "period_month") ?? now.getMonth() + 1;
  const period_year = fdNum(formData, "period_year") ?? now.getFullYear();
  const due_date = `${period_year}-${String(period_month).padStart(2, "0")}-01`;

  const { error } = await supabase.from("maintenance_payments").insert({
    maintenance_id: id,
    period_month,
    period_year,
    amount: fdNum(formData, "amount") ?? Number(m.amount),
    currency: m.currency,
    account_id: fd<string | null>(formData, "account_id", null),
    collected_by: dbUser.id,
    paid_at: new Date().toISOString(),
    status: "cobrado",
    due_date,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/cobros");
  revalidatePath("/tesoreria");
  revalidatePath("/rentabilidad");
}

export async function deleteMaintenanceAction(id: string) {
  const { supabase } = await getSessionUser();
  await supabase.from("maintenances").update({ is_active: false }).eq("id", id);
  revalidatePath("/insumos");
  revalidatePath("/cobros");
}

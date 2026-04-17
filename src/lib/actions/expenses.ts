"use server";

import { revalidatePath } from "next/cache";
import { fd, fdNum, getSessionUser } from "./_helpers";

export async function createExpenseAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("expenses").insert({
    name: fd<string>(formData, "name"),
    category: fd<string | null>(formData, "category", null),
    cost: fdNum(formData, "cost") ?? 0,
    currency: fd<string>(formData, "currency", "USD"),
    frequency: fd<string>(formData, "frequency", "mensual"),
    next_due_date: fd<string | null>(formData, "next_due_date", null),
    project_id: fd<string | null>(formData, "project_id", null),
    client_id: fd<string | null>(formData, "client_id", null),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/insumos");
  revalidatePath("/");
}

export async function payExpenseAction(id: string, formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const { data: exp } = await supabase
    .from("expenses")
    .select("cost, currency, frequency, next_due_date")
    .eq("id", id)
    .single();
  if (!exp) throw new Error("Insumo no encontrado");

  const { error } = await supabase.from("expense_payments").insert({
    expense_id: id,
    amount: fdNum(formData, "amount") ?? Number(exp.cost),
    currency: exp.currency,
    account_id: fd<string | null>(formData, "account_id", null),
    paid_by: dbUser.id,
  });
  if (error) throw new Error(error.message);

  if (exp.frequency === "mensual" && exp.next_due_date) {
    const next = new Date(exp.next_due_date as string);
    next.setMonth(next.getMonth() + 1);
    await supabase
      .from("expenses")
      .update({ next_due_date: next.toISOString().slice(0, 10) })
      .eq("id", id);
  } else if (exp.frequency === "anual" && exp.next_due_date) {
    const next = new Date(exp.next_due_date as string);
    next.setFullYear(next.getFullYear() + 1);
    await supabase
      .from("expenses")
      .update({ next_due_date: next.toISOString().slice(0, 10) })
      .eq("id", id);
  }

  revalidatePath("/insumos");
  revalidatePath("/tesoreria");
  revalidatePath("/rentabilidad");
}

export async function deleteExpenseAction(id: string) {
  const { supabase } = await getSessionUser();
  await supabase.from("expenses").update({ is_active: false }).eq("id", id);
  revalidatePath("/insumos");
}

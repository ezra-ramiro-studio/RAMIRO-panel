"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fd, getSessionUser } from "./_helpers";

export async function createClientAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: fd<string>(formData, "name"),
      industry: fd<string | null>(formData, "industry", null),
      status: fd<string>(formData, "status", "activo"),
      contact_name: fd<string | null>(formData, "contact_name", null),
      phone: fd<string | null>(formData, "phone", null),
      email: fd<string | null>(formData, "email", null),
      preferred_currency: fd<string>(formData, "preferred_currency", "ARS"),
      notes: fd<string | null>(formData, "notes", null),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  redirect(`/clientes/${data.id}`);
}

export async function updateClientAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase
    .from("clients")
    .update({
      name: fd<string>(formData, "name"),
      industry: fd<string | null>(formData, "industry", null),
      status: fd<string>(formData, "status"),
      contact_name: fd<string | null>(formData, "contact_name", null),
      phone: fd<string | null>(formData, "phone", null),
      email: fd<string | null>(formData, "email", null),
      preferred_currency: fd<string>(formData, "preferred_currency", "ARS"),
      notes: fd<string | null>(formData, "notes", null),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}

export async function deleteClientAction(id: string) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  redirect("/clientes");
}

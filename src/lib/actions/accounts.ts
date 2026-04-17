"use server";

import { revalidatePath } from "next/cache";
import { fd, getSessionUser } from "./_helpers";

export async function createAccountAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("accounts").insert({
    name: fd<string>(formData, "name"),
    currency: fd<string>(formData, "currency", "ARS"),
    type: fd<string>(formData, "type", "bank"),
    owner_user_id: fd<string | null>(formData, "owner_user_id", null),
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/tesoreria");
  revalidatePath("/configuracion");
}

export async function updateAccountAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase
    .from("accounts")
    .update({
      name: fd<string>(formData, "name"),
      currency: fd<string>(formData, "currency", "ARS"),
      type: fd<string>(formData, "type"),
      owner_user_id: fd<string | null>(formData, "owner_user_id", null),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tesoreria");
  revalidatePath("/configuracion");
}

export async function deleteAccountAction(id: string) {
  const { supabase } = await getSessionUser();
  await supabase.from("accounts").update({ is_active: false }).eq("id", id);
  revalidatePath("/tesoreria");
  revalidatePath("/configuracion");
}

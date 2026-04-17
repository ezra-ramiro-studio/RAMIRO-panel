"use server";

import { revalidatePath } from "next/cache";
import { fd, getSessionUser } from "./_helpers";

export async function updateBusinessSettingsAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { data: existing } = await supabase
    .from("business_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const payload = {
    name: fd<string>(formData, "name"),
    razon_social: fd<string | null>(formData, "razon_social", null),
    cuit: fd<string | null>(formData, "cuit", null),
    billing_address: fd<string | null>(formData, "billing_address", null),
  };

  if (existing?.id) {
    const { error } = await supabase
      .from("business_settings")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("business_settings").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/configuracion");
  revalidatePath("/");
}

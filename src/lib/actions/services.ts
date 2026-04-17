"use server";

import { revalidatePath } from "next/cache";
import { fd, fdNum, getSessionUser } from "./_helpers";

export async function createServiceAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("services").insert({
    name: fd<string>(formData, "name"),
    description: fd<string | null>(formData, "description", null),
    type: fd<string>(formData, "type", "proyecto"),
    price_ars: fdNum(formData, "price_ars") ?? 0,
    price_usd: fdNum(formData, "price_usd") ?? 0,
    estimated_delivery_days: fdNum(formData, "estimated_delivery_days"),
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/tarifario");
}

export async function updateServiceAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase
    .from("services")
    .update({
      name: fd<string>(formData, "name"),
      description: fd<string | null>(formData, "description", null),
      type: fd<string>(formData, "type"),
      price_ars: fdNum(formData, "price_ars") ?? 0,
      price_usd: fdNum(formData, "price_usd") ?? 0,
      estimated_delivery_days: fdNum(formData, "estimated_delivery_days"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tarifario");
}

export async function deleteServiceAction(id: string) {
  const { supabase } = await getSessionUser();
  await supabase.from("services").update({ is_active: false }).eq("id", id);
  revalidatePath("/tarifario");
}

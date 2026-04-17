"use server";

import { revalidatePath } from "next/cache";
import { fd, fdBool, getSessionUser } from "./_helpers";

export async function createUserAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("users").insert({
    email: fd<string>(formData, "email").toLowerCase(),
    name: fd<string>(formData, "name"),
    role: fd<string>(formData, "role", "member"),
    color: fd<string | null>(formData, "color", null),
    avatar_emoji: fd<string | null>(formData, "avatar_emoji", null),
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/configuracion");
}

export async function updateUserAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase
    .from("users")
    .update({
      name: fd<string>(formData, "name"),
      role: fd<string>(formData, "role"),
      color: fd<string | null>(formData, "color", null),
      avatar_emoji: fd<string | null>(formData, "avatar_emoji", null),
      is_active: fdBool(formData, "is_active"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/configuracion");
}

export async function toggleUserActiveAction(id: string, is_active: boolean) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("users").update({ is_active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/configuracion");
}

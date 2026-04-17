"use server";

import { revalidatePath } from "next/cache";
import { fd, fdBool, getSessionUser } from "./_helpers";

export async function createMilestoneAction(formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const { error } = await supabase.from("milestones").insert({
    title: fd<string>(formData, "title"),
    description: fd<string | null>(formData, "description", null),
    milestone_date:
      fd<string | null>(formData, "milestone_date", null) ??
      new Date().toISOString().slice(0, 10),
    auto_generated: fdBool(formData, "auto_generated"),
    created_by: dbUser.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/logros");
}

export async function deleteMilestoneAction(id: string) {
  const { supabase } = await getSessionUser();
  await supabase.from("milestones").delete().eq("id", id);
  revalidatePath("/logros");
}

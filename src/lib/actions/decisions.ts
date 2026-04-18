"use server";

import { revalidatePath } from "next/cache";
import { fd, getSessionUser } from "./_helpers";

export async function createDecisionAction(formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const projectId = fd<string>(formData, "project_id");
  const { error } = await supabase.from("decision_log").insert({
    project_id: projectId,
    title: fd<string>(formData, "title"),
    description: fd<string | null>(formData, "description", null),
    decided_by: dbUser.id,
    decided_at:
      fd<string | null>(formData, "decided_at", null) ??
      new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/proyectos/${projectId}`);
}

export async function updateDecisionAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { data: prev } = await supabase
    .from("decision_log")
    .select("project_id")
    .eq("id", id)
    .single();
  const projectId = fd<string>(formData, "project_id", prev?.project_id ?? "");
  const { error } = await supabase
    .from("decision_log")
    .update({
      title: fd<string>(formData, "title"),
      description: fd<string | null>(formData, "description", null),
      decided_at:
        fd<string | null>(formData, "decided_at", null) ??
        new Date().toISOString().slice(0, 10),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function deleteDecisionAction(id: string, projectId: string) {
  const { supabase } = await getSessionUser();
  await supabase.from("decision_log").delete().eq("id", id);
  revalidatePath(`/proyectos/${projectId}`);
}

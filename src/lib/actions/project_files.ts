"use server";

import { revalidatePath } from "next/cache";
import { fd, getSessionUser } from "./_helpers";

export async function createProjectFileAction(formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const projectId = fd<string>(formData, "project_id");
  const { error } = await supabase.from("project_files").insert({
    project_id: projectId,
    name: fd<string>(formData, "name"),
    url: fd<string>(formData, "url"),
    type: fd<string | null>(formData, "type", null),
    uploaded_by: dbUser.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/proyectos/${projectId}`);
}

export async function updateProjectFileAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { data: prev } = await supabase
    .from("project_files")
    .select("project_id")
    .eq("id", id)
    .single();
  const projectId = fd<string>(formData, "project_id", prev?.project_id ?? "");
  const { error } = await supabase
    .from("project_files")
    .update({
      name: fd<string>(formData, "name"),
      url: fd<string>(formData, "url"),
      type: fd<string | null>(formData, "type", null),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function deleteProjectFileAction(id: string, projectId: string) {
  const { supabase } = await getSessionUser();
  await supabase.from("project_files").delete().eq("id", id);
  revalidatePath(`/proyectos/${projectId}`);
}

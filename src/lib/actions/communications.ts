"use server";

import { revalidatePath } from "next/cache";
import { fd, getSessionUser } from "./_helpers";

export async function createCommunicationAction(formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const projectId = fd<string>(formData, "project_id");
  const { error } = await supabase.from("communications").insert({
    project_id: projectId,
    client_id: fd<string>(formData, "client_id"),
    type: fd<string>(formData, "type", "email"),
    subject: fd<string | null>(formData, "subject", null),
    content: fd<string | null>(formData, "content", null),
    contacted_at:
      fd<string | null>(formData, "contacted_at", null) ?? new Date().toISOString(),
    contacted_by: dbUser.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/proyectos/${projectId}`);
}

export async function updateCommunicationAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { data: prev } = await supabase
    .from("communications")
    .select("project_id")
    .eq("id", id)
    .single();
  const projectId = fd<string>(formData, "project_id", prev?.project_id ?? "");
  const { error } = await supabase
    .from("communications")
    .update({
      client_id: fd<string>(formData, "client_id"),
      type: fd<string>(formData, "type", "email"),
      subject: fd<string | null>(formData, "subject", null),
      content: fd<string | null>(formData, "content", null),
      contacted_at:
        fd<string | null>(formData, "contacted_at", null) ??
        new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function deleteCommunicationAction(id: string, projectId: string) {
  const { supabase } = await getSessionUser();
  await supabase.from("communications").delete().eq("id", id);
  revalidatePath(`/proyectos/${projectId}`);
}

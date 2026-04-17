"use server";

import { revalidatePath } from "next/cache";
import { fd, getSessionUser } from "./_helpers";

export async function createTaskAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("tasks").insert({
    project_id: fd<string>(formData, "project_id"),
    title: fd<string>(formData, "title"),
    description: fd<string | null>(formData, "description", null),
    assigned_to: fd<string | null>(formData, "assigned_to", null),
    priority: fd<string>(formData, "priority", "media"),
    status: fd<string>(formData, "status", "pendiente"),
    due_date: fd<string | null>(formData, "due_date", null),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/tareas");
  revalidatePath("/");
  const projectId = fd<string>(formData, "project_id");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function toggleTaskAction(id: string) {
  const { supabase } = await getSessionUser();
  const { data } = await supabase.from("tasks").select("status,project_id").eq("id", id).single();
  if (!data) return;
  const newStatus = data.status === "completada" ? "pendiente" : "completada";
  const patch: Record<string, unknown> = { status: newStatus };
  patch.completed_at = newStatus === "completada" ? new Date().toISOString() : null;
  await supabase.from("tasks").update(patch).eq("id", id);
  revalidatePath("/tareas");
  revalidatePath("/");
  if (data.project_id) revalidatePath(`/proyectos/${data.project_id}`);
}

export async function deleteTaskAction(id: string) {
  const { supabase } = await getSessionUser();
  const { data } = await supabase.from("tasks").select("project_id").eq("id", id).single();
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/tareas");
  revalidatePath("/");
  if (data?.project_id) revalidatePath(`/proyectos/${data.project_id}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fd, fdNum, getSessionUser } from "./_helpers";

export async function createProjectAction(formData: FormData) {
  const { supabase } = await getSessionUser();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      client_id: fd<string>(formData, "client_id"),
      name: fd<string>(formData, "name"),
      description: fd<string | null>(formData, "description", null),
      status: fd<string>(formData, "status", "activo"),
      phase: fd<string>(formData, "phase", "descubrimiento"),
      start_date: fd<string | null>(formData, "start_date", null),
      end_date: fd<string | null>(formData, "end_date", null),
      responsible_user_id: fd<string | null>(formData, "responsible_user_id", null),
      total_amount: fdNum(formData, "total_amount") ?? 0,
      currency: fd<string>(formData, "currency", "ARS"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/clientes");
  redirect(`/proyectos/${data.id}`);
}

export async function updateProjectAction(id: string, formData: FormData) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase
    .from("projects")
    .update({
      name: fd<string>(formData, "name"),
      description: fd<string | null>(formData, "description", null),
      status: fd<string>(formData, "status"),
      start_date: fd<string | null>(formData, "start_date", null),
      end_date: fd<string | null>(formData, "end_date", null),
      responsible_user_id: fd<string | null>(formData, "responsible_user_id", null),
      total_amount: fdNum(formData, "total_amount") ?? 0,
      currency: fd<string>(formData, "currency", "ARS"),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/proyectos/${id}`);
  revalidatePath("/clientes");
}

export async function changePhaseAction(id: string, formData: FormData) {
  const { supabase, dbUser } = await getSessionUser();
  const toPhase = fd<string>(formData, "phase");
  const { data: current } = await supabase.from("projects").select("phase").eq("id", id).single();
  const fromPhase = current?.phase ?? null;
  if (fromPhase === toPhase) return;

  const { error } = await supabase.from("projects").update({ phase: toPhase }).eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("project_phase_history").insert({
    project_id: id,
    from_phase: fromPhase,
    to_phase: toPhase,
    changed_by: dbUser.id,
  });
  revalidatePath(`/proyectos/${id}`);
}

export async function deleteProjectAction(id: string) {
  const { supabase } = await getSessionUser();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
  redirect("/");
}

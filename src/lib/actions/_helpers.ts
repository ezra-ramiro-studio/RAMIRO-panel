import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("No autenticado");
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  if (!data) throw new Error("Usuario sin perfil en la base");
  return { supabase, dbUser: data };
}

export function fd<T = string>(form: FormData, key: string, fallback?: T): T {
  const v = form.get(key);
  if (v === null || v === "") return (fallback ?? (null as unknown)) as T;
  return v as unknown as T;
}

export function fdNum(form: FormData, key: string): number | null {
  const v = form.get(key);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function fdBool(form: FormData, key: string): boolean {
  return form.get(key) === "on" || form.get(key) === "true";
}

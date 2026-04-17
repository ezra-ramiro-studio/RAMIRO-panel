import { createClient } from "@/lib/supabase/server";

export async function isAuthorizedEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("is_active")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return !!data?.is_active;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser?.email) return null;
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", authUser.email.toLowerCase())
    .maybeSingle();
  return data;
}

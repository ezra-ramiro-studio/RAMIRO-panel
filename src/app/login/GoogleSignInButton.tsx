"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-[6px] transition-all text-[14px] font-medium hover:brightness-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: "var(--color-burgundy)",
          color: "var(--color-bg)",
          border: "1px solid var(--color-burgundy)",
        }}
      >
        <GoogleIcon />
        {loading ? "Redirigiendo…" : "Acceder con Google"}
      </button>
      {error ? (
        <div
          className="mt-3 text-[12px]"
          style={{ color: "var(--color-burgundy)" }}
        >
          {error}
        </div>
      ) : null}
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#F2ECDF"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.17v2.84A11 11 0 0012 23z"
        fill="#F2ECDF"
      />
      <path
        d="M5.85 14.11a6.6 6.6 0 010-4.22V7.05H2.17a11 11 0 000 9.9l3.68-2.84z"
        fill="#F2ECDF"
      />
      <path
        d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.1 14.97 1 12 1A11 11 0 002.17 7.05l3.68 2.84C6.72 7.31 9.14 5.38 12 5.38z"
        fill="#F2ECDF"
      />
    </svg>
  );
}

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Ambient washes — warm paper */}
      <div
        className="absolute top-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(107,31,43,0.10)" }}
      />
      <div
        className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(196,122,62,0.12)" }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(74,122,62,0.08)" }}
      />

      <div className="relative w-full max-w-[440px]">
        <div className="text-center mb-10">
          <div
            className="mono text-[10px] uppercase tracking-[0.24em] mb-3 flex items-center justify-center gap-3"
            style={{ color: "var(--color-muted)" }}
          >
            <span
              className="inline-block w-6 h-[1px]"
              style={{ background: "var(--color-burgundy)" }}
            />
            Marcos · Ezra
            <span
              className="inline-block w-6 h-[1px]"
              style={{ background: "var(--color-burgundy)" }}
            />
          </div>
          <div className="display text-[56px] leading-[0.95] tracking-[0.02em]">
            Panel
            <span
              className="serif italic ml-2"
              style={{ color: "var(--color-burgundy)", fontSize: "0.75em" }}
            >
              interno
            </span>
          </div>
          <div
            className="serif italic text-[14px] mt-3"
            style={{ color: "var(--color-muted)" }}
          >
            Gestión interna del estudio
          </div>
        </div>

        <div
          className="rounded-[10px] border p-8"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border-2)",
          }}
        >
          <div
            className="mono text-[11px] uppercase tracking-[0.2em] mb-1.5"
            style={{ color: "var(--color-burgundy)" }}
          >
            Iniciar sesión
          </div>
          <div
            className="serif italic text-[13px] mb-6"
            style={{ color: "var(--color-muted)" }}
          >
            Solo cuentas autorizadas pueden entrar al panel.
          </div>

          <Link
            href="/"
            className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-[6px] transition-all text-[14px] font-medium hover:brightness-[0.97]"
            style={{
              background: "var(--color-burgundy)",
              color: "var(--color-bg)",
              border: "1px solid var(--color-burgundy)",
            }}
          >
            <GoogleIcon />
            Acceder con Google
          </Link>

          <div
            className="mt-6 pt-5 flex items-center gap-2"
            style={{ borderTop: "1px solid var(--color-border-1)" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
            <div
              className="text-[12px]"
              style={{ color: "var(--color-muted)" }}
            >
              Lista blanca activa · solo Marcos y Ezra.
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] mono uppercase tracking-[0.14em] text-[var(--color-muted)]">
          <div className="flex items-center gap-1.5">
            <span
              className="w-[6px] h-[6px] rounded-full"
              style={{ background: "var(--color-ops)" }}
            />
            Operaciones
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-[6px] h-[6px] rounded-full"
              style={{ background: "var(--color-fin)" }}
            />
            Finanzas
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-[6px] h-[6px] rounded-full"
              style={{ background: "var(--color-grow)" }}
            />
            Crecimiento
          </div>
        </div>
      </div>
    </div>
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

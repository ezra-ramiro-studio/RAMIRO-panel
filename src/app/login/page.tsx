import { GoogleSignInButton } from "./GoogleSignInButton";

const ERROR_MESSAGES: Record<string, string> = {
  not_allowed:
    "Ese correo no está autorizado. Entrá con la cuenta de Marcos o Ezra.",
  missing_code: "No pudimos completar el ingreso. Probá de nuevo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error
    ? (ERROR_MESSAGES[error] ?? decodeURIComponent(error))
    : null;
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

          <GoogleSignInButton />

          {message ? (
            <div
              className="mt-4 px-3 py-2 rounded-[6px] text-[12px]"
              style={{
                background: "rgba(107,31,43,0.08)",
                color: "var(--color-burgundy)",
                border: "1px solid rgba(107,31,43,0.2)",
              }}
            >
              {message}
            </div>
          ) : null}

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


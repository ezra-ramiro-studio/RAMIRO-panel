export const ALLOWED_EMAILS = [
  "ezra@ramiro.studio",
  "marcos@ramiro.studio",
] as const;

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(
    email.toLowerCase() as (typeof ALLOWED_EMAILS)[number],
  );
}

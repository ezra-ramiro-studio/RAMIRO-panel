import type { Currency } from "./types";

export function formatCurrency(amount: number, currency: Currency): string {
  const locale = currency === "USD" ? "en-US" : "es-AR";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(amount);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function daysUntil(iso: string, from: Date = new Date("2026-04-16")): number {
  const target = new Date(iso);
  const ms = target.getTime() - from.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function relativeDays(days: number): string {
  if (days === 0) return "hoy";
  if (days === 1) return "mañana";
  if (days === -1) return "ayer";
  if (days > 0) return `en ${days} días`;
  return `hace ${Math.abs(days)} días`;
}

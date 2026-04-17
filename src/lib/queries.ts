import {
  accounts,
  clients,
  currentUser,
  expenses,
  maintenancePayments,
  maintenances,
  payments,
  projects,
  prospects,
  tasks,
  users,
} from "./mock";
import type {
  Client,
  Currency,
  Payment,
  PaymentStatus,
  Project,
  Task,
  User,
} from "./types";
import { daysUntil } from "./format";

export const TODAY = new Date("2026-04-16");

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getClient(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function projectsByClient(clientId: string): Project[] {
  return projects.filter((p) => p.client_id === clientId);
}

export function tasksByProject(projectId: string): Task[] {
  return tasks.filter((t) => t.project_id === projectId);
}

export function paymentsByProject(projectId: string): Payment[] {
  return payments.filter((p) => p.project_id === projectId);
}

export function todayTasks(userId: string = currentUser.id): Task[] {
  return tasks
    .filter((t) => t.assigned_to === userId && t.status !== "completada")
    .filter((t) => daysUntil(t.due_date) <= 1)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export function myTasks(userId: string = currentUser.id): Task[] {
  return tasks
    .filter((t) => t.assigned_to === userId && t.status !== "completada")
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
}

export interface UpcomingCollection {
  id: string;
  date: string;
  client: string;
  project: string;
  description: string;
  amount: number;
  currency: Currency;
  type: "proyecto" | "mantenimiento";
  status: PaymentStatus;
}

export function upcomingCollections(days: number = 30): UpcomingCollection[] {
  const out: UpcomingCollection[] = [];

  for (const p of payments) {
    const d = daysUntil(p.scheduled_date);
    if (p.status === "cobrado") continue;
    if (d < -30 || d > days) continue;
    const proj = getProject(p.project_id);
    const cli = proj ? getClient(proj.client_id) : undefined;
    out.push({
      id: p.id,
      date: p.scheduled_date,
      client: cli?.name ?? "—",
      project: proj?.name ?? "—",
      description: p.description,
      amount: p.amount,
      currency: p.currency,
      type: "proyecto",
      status: d < 0 ? "vencido" : p.status,
    });
  }

  for (const mp of maintenancePayments) {
    const d = daysUntil(mp.scheduled_date);
    if (mp.status === "cobrado") continue;
    if (d < -30 || d > days) continue;
    const m = maintenances.find((x) => x.id === mp.maintenance_id);
    const proj = m ? getProject(m.project_id) : undefined;
    const cli = proj ? getClient(proj.client_id) : undefined;
    out.push({
      id: mp.id,
      date: mp.scheduled_date,
      client: cli?.name ?? "—",
      project: proj?.name ?? "—",
      description: `${m?.description ?? "Mantenimiento"} · ${mp.period}`,
      amount: m?.amount ?? 0,
      currency: m?.currency ?? "ARS",
      type: "mantenimiento",
      status: d < 0 ? "vencido" : mp.status,
    });
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export interface TreasuryAccount {
  account_id: string;
  name: string;
  owner: string;
  currency: Currency;
  income_projects: number;
  income_maintenances: number;
  outflow: number;
  balance: number;
}

export function treasuryByAccount(): TreasuryAccount[] {
  return accounts.map((acc) => {
    const ownerName = getUser(acc.owner_id)?.name ?? "—";
    const income_projects = payments
      .filter((p) => p.account_id === acc.id && p.status === "cobrado")
      .reduce((s, p) => s + p.amount, 0);
    const income_maintenances = maintenancePayments
      .filter((mp) => mp.account_id === acc.id && mp.status === "cobrado")
      .reduce((s, mp) => {
        const m = maintenances.find((x) => x.id === mp.maintenance_id);
        return s + (m?.amount ?? 0);
      }, 0);
    const outflow = 0; // no expense_payments mock
    return {
      account_id: acc.id,
      name: acc.name,
      owner: ownerName,
      currency: acc.currency,
      income_projects,
      income_maintenances,
      outflow,
      balance: income_projects + income_maintenances - outflow,
    };
  });
}

export function treasuryTotals(): { ars: number; usd: number } {
  const t = treasuryByAccount();
  return {
    ars: t.filter((x) => x.currency === "ARS").reduce((s, x) => s + x.balance, 0),
    usd: t.filter((x) => x.currency === "USD").reduce((s, x) => s + x.balance, 0),
  };
}

export function expiringExpenses(days: number = 14) {
  return expenses
    .filter((e) => daysUntil(e.next_due_date) <= days)
    .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date));
}

export function monthlyMaintenances(period: string = "2026-04") {
  return maintenancePayments
    .filter((mp) => mp.period === period)
    .map((mp) => {
      const m = maintenances.find((x) => x.id === mp.maintenance_id);
      const proj = m ? getProject(m.project_id) : undefined;
      const cli = proj ? getClient(proj.client_id) : undefined;
      return {
        id: mp.id,
        client: cli?.name ?? "—",
        project: proj?.name ?? "—",
        description: m?.description ?? "",
        amount: m?.amount ?? 0,
        currency: m?.currency ?? ("ARS" as Currency),
        status: mp.status,
        scheduled_date: mp.scheduled_date,
      };
    });
}

export interface ClientSummary extends Client {
  active_projects: number;
  billed_ars: number;
  billed_usd: number;
}

export function clientSummaries(): ClientSummary[] {
  return clients.map((c) => {
    const cp = projectsByClient(c.id);
    const active = cp.filter((p) => p.status === "activo").length;
    const billed = payments
      .filter((p) => p.status === "cobrado")
      .filter((p) => cp.some((pr) => pr.id === p.project_id));
    const billed_ars = billed.filter((p) => p.currency === "ARS").reduce((s, p) => s + p.amount, 0);
    const billed_usd = billed.filter((p) => p.currency === "USD").reduce((s, p) => s + p.amount, 0);
    return { ...c, active_projects: active, billed_ars, billed_usd };
  });
}

export interface Profitability {
  project_id: string;
  project: string;
  client: string;
  income: number;
  expenses: number;
  net: number;
  margin: number;
  currency: Currency;
}

export function profitabilityByProject(): Profitability[] {
  return projects.map((p) => {
    const income = payments
      .filter((x) => x.project_id === p.id && x.status === "cobrado")
      .reduce((s, x) => s + x.amount, 0);
    const exp = expenses
      .filter((e) => e.project_id === p.id)
      .reduce((s, e) => s + e.cost, 0);
    const net = income - exp;
    const margin = income > 0 ? (net / income) * 100 : 0;
    return {
      project_id: p.id,
      project: p.name,
      client: getClient(p.client_id)?.name ?? "—",
      income,
      expenses: exp,
      net,
      margin,
      currency: p.currency,
    };
  });
}

export function profitabilityByClient() {
  return clients.map((c) => {
    const cp = projectsByClient(c.id);
    const income = payments
      .filter((x) => x.status === "cobrado" && cp.some((pr) => pr.id === x.project_id))
      .reduce((s, x) => s + x.amount, 0);
    const exp = expenses
      .filter((e) => e.client_id === c.id || cp.some((pr) => pr.id === e.project_id))
      .reduce((s, e) => s + e.cost, 0);
    const net = income - exp;
    const margin = income > 0 ? (net / income) * 100 : 0;
    return {
      client_id: c.id,
      client: c.name,
      projects: cp.length,
      income,
      expenses: exp,
      net,
      margin,
      currency: c.preferred_currency,
    };
  });
}

export function prospectsByStage() {
  const stages = [
    "contacto_inicial",
    "propuesta_enviada",
    "negociacion",
    "cerrado_ganado",
    "cerrado_perdido",
  ] as const;
  return stages.map((s) => ({
    stage: s,
    items: prospects.filter((p) => p.stage === s),
  }));
}

export function closeRate(): number {
  const won = prospects.filter((p) => p.stage === "cerrado_ganado").length;
  const lost = prospects.filter((p) => p.stage === "cerrado_perdido").length;
  const closed = won + lost;
  return closed === 0 ? 0 : (won / closed) * 100;
}

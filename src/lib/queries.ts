import { createClient } from "@/lib/supabase/server";
import { daysUntil } from "./format";
import type {
  Account,
  AuditLog,
  BusinessSettings,
  Client,
  Communication,
  Currency,
  Decision,
  Expense,
  Maintenance,
  MaintenancePayment,
  Milestone,
  Payment,
  PaymentStatus,
  Project,
  ProjectFile,
  ProjectPhaseHistory,
  Prospect,
  Service,
  Task,
  User,
} from "./types";

export const TODAY_ISO = new Date().toISOString().slice(0, 10);

function mapClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    industry: (row.industry as string | null) ?? null,
    status: (row.status as "activo" | "inactivo") ?? "activo",
    contact: (row.contact_name as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    preferred_currency: ((row.preferred_currency as Currency | null) ?? "ARS"),
    notes: (row.notes as string | null) ?? null,
    is_active: row.status === "activo",
    created_at: row.created_at as string,
  };
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    client_id: row.client_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    status: row.status as Project["status"],
    phase: row.phase as Project["phase"],
    start_date: (row.start_date as string | null) ?? null,
    end_date: (row.end_date as string | null) ?? null,
    responsible_user_id: (row.responsible_user_id as string | null) ?? null,
    total_amount: Number(row.total_amount ?? 0),
    currency: ((row.currency as Currency | null) ?? "ARS"),
    created_at: row.created_at as string,
  };
}

function mapTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    assigned_to: (row.assigned_to as string | null) ?? null,
    priority: row.priority as Task["priority"],
    status: row.status as Task["status"],
    due_date: (row.due_date as string | null) ?? null,
    completed_at: (row.completed_at as string | null) ?? null,
  };
}

function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    description: row.description as string,
    amount: Number(row.amount),
    currency: row.currency as Currency,
    due_date: (row.due_date as string | null) ?? null,
    status: row.status as PaymentStatus,
    paid_at: (row.paid_at as string | null) ?? null,
    payment_method: (row.payment_method as string | null) ?? null,
    collected_by: (row.collected_by as string | null) ?? null,
    account_id: (row.account_id as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
  };
}

function mapAccount(row: Record<string, unknown>): Account {
  return {
    id: row.id as string,
    name: row.name as string,
    owner_user_id: (row.owner_user_id as string | null) ?? null,
    type: row.type as Account["type"],
    currency: row.currency as Currency,
    is_active: Boolean(row.is_active),
  };
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role: row.role as User["role"],
    avatar_url: (row.avatar_url as string | null) ?? null,
    is_active: Boolean(row.is_active),
    color: (row.color as "ops" | "grow" | null) ?? null,
    avatar_emoji: (row.avatar_emoji as string | null) ?? null,
  };
}

function mapExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    name: row.name as string,
    category: (row.category as string | null) ?? null,
    cost: Number(row.cost),
    currency: row.currency as Currency,
    frequency: row.frequency as Expense["frequency"],
    next_due_date: (row.next_due_date as string | null) ?? null,
    project_id: (row.project_id as string | null) ?? null,
    client_id: (row.client_id as string | null) ?? null,
    is_active: Boolean(row.is_active),
  };
}

function mapMaintenance(row: Record<string, unknown>): Maintenance {
  return {
    id: row.id as string,
    project_id: (row.project_id as string | null) ?? null,
    client_id: row.client_id as string,
    description: row.description as string,
    amount: Number(row.amount),
    currency: row.currency as Currency,
    day_of_month: Number(row.day_of_month ?? 1),
    is_active: Boolean(row.is_active),
  };
}

function mapMaintenancePayment(row: Record<string, unknown>): MaintenancePayment {
  return {
    id: row.id as string,
    maintenance_id: row.maintenance_id as string,
    period_month: Number(row.period_month),
    period_year: Number(row.period_year),
    amount: Number(row.amount),
    currency: row.currency as Currency,
    due_date: row.due_date as string,
    status: row.status as PaymentStatus,
    paid_at: (row.paid_at as string | null) ?? null,
    payment_method: (row.payment_method as string | null) ?? null,
    collected_by: (row.collected_by as string | null) ?? null,
    account_id: (row.account_id as string | null) ?? null,
  };
}

function mapProspect(row: Record<string, unknown>): Prospect {
  return {
    id: row.id as string,
    name: row.name as string,
    company: (row.company as string | null) ?? null,
    origin: (row.origin as string | null) ?? null,
    stage: row.stage as Prospect["stage"],
    responsible_user_id: (row.responsible_user_id as string | null) ?? null,
    estimated_amount: row.estimated_amount !== null ? Number(row.estimated_amount) : null,
    estimated_currency: (row.estimated_currency as Currency | null) ?? null,
    next_step: (row.next_step as string | null) ?? null,
    next_step_date: (row.next_step_date as string | null) ?? null,
    converted_client_id: (row.converted_client_id as string | null) ?? null,
    converted_project_id: (row.converted_project_id as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
  };
}

function mapService(row: Record<string, unknown>): Service {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    price_ars: row.price_ars !== null ? Number(row.price_ars) : null,
    price_usd: row.price_usd !== null ? Number(row.price_usd) : null,
    type: row.type as Service["type"],
    estimated_delivery_days:
      row.estimated_delivery_days !== null ? Number(row.estimated_delivery_days) : null,
    is_active: Boolean(row.is_active),
  };
}

function mapMilestone(row: Record<string, unknown>): Milestone {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    milestone_date: row.milestone_date as string,
    auto_generated: Boolean(row.auto_generated),
    created_by: (row.created_by as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

function mapAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    action: row.action as AuditLog["action"],
    entity_type: row.entity_type as string,
    entity_id: row.entity_id as string,
    description: (row.description as string | null) ?? null,
    old_value: (row.old_value as Record<string, unknown> | null) ?? null,
    new_value: (row.new_value as Record<string, unknown> | null) ?? null,
    created_at: row.created_at as string,
  };
}

function mapProjectFile(row: Record<string, unknown>): ProjectFile {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    name: row.name as string,
    url: row.url as string,
    type: (row.type as ProjectFile["type"]) ?? "otro",
    uploaded_by: (row.uploaded_by as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

function mapDecision(row: Record<string, unknown>): Decision {
  return {
    id: row.id as string,
    project_id: row.project_id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    decided_at: row.decided_at as string,
    decided_by: row.decided_by as string,
    created_at: row.created_at as string,
  };
}

function mapCommunication(row: Record<string, unknown>): Communication {
  return {
    id: row.id as string,
    project_id: (row.project_id as string | null) ?? null,
    client_id: row.client_id as string,
    subject: (row.subject as string | null) ?? null,
    content: (row.content as string | null) ?? null,
    type: (row.type as Communication["type"]) ?? "otro",
    contacted_at: row.contacted_at as string,
    contacted_by: row.contacted_by as string,
  };
}

// ============ FETCHERS ============

export async function fetchCurrentUser(): Promise<User | null> {
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
  return data ? mapUser(data) : null;
}

export async function fetchUsers(): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("*").order("name");
  return (data ?? []).map(mapUser);
}

export async function getUser(id: string): Promise<User | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  return data ? mapUser(data) : null;
}

export async function fetchClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapClient);
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  return data ? mapClient(data) : null;
}

export async function fetchProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapProject);
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  return data ? mapProject(data) : null;
}

export async function projectsByClient(clientId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
  return (data ?? []).map(mapProject);
}

export async function fetchTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("*").order("due_date");
  return (data ?? []).map(mapTask);
}

export async function tasksByProject(projectId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("*").eq("project_id", projectId).order("due_date");
  return (data ?? []).map(mapTask);
}

export async function tasksAssignedTo(userId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", userId)
    .neq("status", "completada")
    .order("due_date");
  return (data ?? []).map(mapTask);
}

export async function todayTasks(userId: string): Promise<Task[]> {
  const all = await tasksAssignedTo(userId);
  return all.filter((t) => t.due_date && daysUntil(t.due_date) <= 1);
}

export async function fetchPayments(): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("payments").select("*").order("due_date");
  return (data ?? []).map(mapPayment);
}

export async function paymentsByProject(projectId: string): Promise<Payment[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("payments").select("*").eq("project_id", projectId).order("due_date");
  return (data ?? []).map(mapPayment);
}

export async function fetchAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("accounts").select("*").eq("is_active", true).order("name");
  return (data ?? []).map(mapAccount);
}

export async function fetchExpenses(): Promise<Expense[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("expenses").select("*").eq("is_active", true).order("next_due_date");
  return (data ?? []).map(mapExpense);
}

export async function expiringExpenses(days: number = 14) {
  const supabase = await createClient();
  const { data } = await supabase.from("v_expiring_expenses").select("*").order("next_due_date").limit(50);
  return (data ?? []).filter((e) => e.next_due_date && daysUntil(e.next_due_date as string) <= days).map((e) => ({
    id: e.id as string,
    name: e.name as string,
    category: (e.category as string) ?? "",
    cost: Number(e.cost),
    currency: e.currency as Currency,
    frequency: e.frequency as Expense["frequency"],
    next_due_date: e.next_due_date as string,
    project_id: e.project_id as string | null,
    client_id: e.client_id as string | null,
    project_name: (e.project_name as string | null) ?? null,
    client_name: (e.client_name as string | null) ?? null,
  }));
}

export async function fetchMaintenances(): Promise<Maintenance[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("maintenances").select("*").order("description");
  return (data ?? []).map(mapMaintenance);
}

export async function maintenancesByProject(projectId: string): Promise<Maintenance[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("maintenances").select("*").eq("project_id", projectId);
  return (data ?? []).map(mapMaintenance);
}

export async function fetchMaintenancePayments(): Promise<MaintenancePayment[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("maintenance_payments").select("*").order("due_date");
  return (data ?? []).map(mapMaintenancePayment);
}

export async function fetchProspects(): Promise<Prospect[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("prospects").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapProspect);
}

export async function fetchServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").eq("is_active", true).order("name");
  return (data ?? []).map(mapService);
}

export async function fetchMilestones(): Promise<Milestone[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("milestones").select("*").order("milestone_date", { ascending: false });
  return (data ?? []).map(mapMilestone);
}

export async function fetchAuditLog(limit: number = 50): Promise<AuditLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(mapAuditLog);
}

export async function projectFiles(projectId: string): Promise<ProjectFile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("project_files").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
  return (data ?? []).map(mapProjectFile);
}

export async function decisionsByProject(projectId: string): Promise<Decision[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("decision_log").select("*").eq("project_id", projectId).order("decided_at", { ascending: false });
  return (data ?? []).map(mapDecision);
}

export async function communicationsByProject(projectId: string): Promise<Communication[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("communications").select("*").eq("project_id", projectId).order("contacted_at", { ascending: false });
  return (data ?? []).map(mapCommunication);
}

export async function phaseHistoryByProject(projectId: string): Promise<ProjectPhaseHistory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_phase_history")
    .select("*")
    .eq("project_id", projectId)
    .order("changed_at", { ascending: false });
  return (data ?? []).map((row) => ({
    id: row.id as string,
    project_id: row.project_id as string,
    from_phase: (row.from_phase as ProjectPhaseHistory["from_phase"]) ?? null,
    to_phase: row.to_phase as ProjectPhaseHistory["to_phase"],
    changed_by: row.changed_by as string,
    changed_at: row.changed_at as string,
  }));
}

export async function fetchBusinessSettings(): Promise<BusinessSettings | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("business_settings").select("*").limit(1).maybeSingle();
  return data
    ? {
        id: data.id as string,
        name: data.name as string,
        razon_social: (data.razon_social as string | null) ?? null,
        cuit: (data.cuit as string | null) ?? null,
        billing_address: (data.billing_address as string | null) ?? null,
        billing_data: (data.billing_data as Record<string, unknown> | null) ?? null,
      }
    : null;
}

// ============ AGGREGATES ============

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

export async function upcomingCollections(days: number = 30): Promise<UpcomingCollection[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("v_upcoming_collections").select("*").order("due_date").limit(200);
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows
    .filter((r) => {
      const d = daysUntil(r.due_date as string);
      return d >= -30 && d <= days;
    })
    .map((r) => ({
      id: r.id as string,
      date: r.due_date as string,
      client: (r.client_name as string) ?? "—",
      project: (r.project_name as string) ?? "—",
      description: (r.description as string) ?? "",
      amount: Number(r.amount ?? 0),
      currency: (r.currency as Currency) ?? "ARS",
      type: ((r.source_type as string) === "maintenance" ? "mantenimiento" : "proyecto") as "proyecto" | "mantenimiento",
      status:
        daysUntil(r.due_date as string) < 0 && r.status !== "cobrado"
          ? "vencido"
          : (r.status as PaymentStatus),
    }));
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

export async function treasuryByAccount(): Promise<TreasuryAccount[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("v_treasury_by_account").select("*");
  const accounts = await fetchAccounts();
  const users = await fetchUsers();
  return ((data ?? []) as Record<string, unknown>[]).map((r) => {
    const acc = accounts.find((a) => a.id === r.account_id);
    const owner = users.find((u) => u.id === acc?.owner_user_id);
    return {
      account_id: (r.account_id as string) ?? "",
      name: (r.account_name as string) ?? "—",
      owner: owner?.name ?? "—",
      currency: (r.currency as Currency) ?? "ARS",
      income_projects: Number(r.project_income ?? 0),
      income_maintenances: Number(r.maintenance_income ?? 0),
      outflow: Number(r.expenses_total ?? 0),
      balance: Number(r.net_balance ?? 0),
    };
  });
}

export async function treasuryTotals(): Promise<{ ars: number; usd: number }> {
  const t = await treasuryByAccount();
  return {
    ars: t.filter((x) => x.currency === "ARS").reduce((s, x) => s + x.balance, 0),
    usd: t.filter((x) => x.currency === "USD").reduce((s, x) => s + x.balance, 0),
  };
}

export async function treasuryByAccountForPeriod(
  from?: string,
  to?: string,
): Promise<TreasuryAccount[]> {
  const supabase = await createClient();
  const accounts = await fetchAccounts();
  const users = await fetchUsers();

  let paymentsQ = supabase
    .from("payments")
    .select("account_id,paid_amount,paid_at,currency,status");
  if (from) paymentsQ = paymentsQ.gte("paid_at", from);
  if (to) paymentsQ = paymentsQ.lte("paid_at", to);
  const { data: payments } = await paymentsQ.eq("status", "cobrado");

  let mainQ = supabase
    .from("maintenance_payments")
    .select("account_id,paid_amount,paid_at,currency,status");
  if (from) mainQ = mainQ.gte("paid_at", from);
  if (to) mainQ = mainQ.lte("paid_at", to);
  const { data: mainPays } = await mainQ.eq("status", "cobrado");

  let expQ = supabase
    .from("expense_payments")
    .select("account_id,amount,paid_at,currency");
  if (from) expQ = expQ.gte("paid_at", from);
  if (to) expQ = expQ.lte("paid_at", to);
  const { data: expPays } = await expQ;

  return accounts.map((acc) => {
    const owner = users.find((u) => u.id === acc.owner_user_id);
    const ip = (payments ?? [])
      .filter((r) => (r.account_id as string | null) === acc.id)
      .reduce((s, r) => s + Number(r.paid_amount ?? 0), 0);
    const im = (mainPays ?? [])
      .filter((r) => (r.account_id as string | null) === acc.id)
      .reduce((s, r) => s + Number(r.paid_amount ?? 0), 0);
    const out = (expPays ?? [])
      .filter((r) => (r.account_id as string | null) === acc.id)
      .reduce((s, r) => s + Number(r.amount ?? 0), 0);
    return {
      account_id: acc.id,
      name: acc.name,
      owner: owner?.name ?? "—",
      currency: acc.currency,
      income_projects: ip,
      income_maintenances: im,
      outflow: out,
      balance: ip + im - out,
    };
  });
}

export async function monthlyMaintenances(period?: string) {
  const supabase = await createClient();
  let query = supabase.from("v_monthly_maintenances").select("*");
  if (period) {
    const [y, m] = period.split("-").map(Number);
    query = query.eq("period_year", y).eq("period_month", m);
  }
  const { data } = await query.order("due_date");
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: (r.payment_id as string) ?? (r.maintenance_id as string),
    client: (r.client_name as string) ?? "—",
    project: (r.project_name as string) ?? "—",
    description: (r.description as string) ?? "",
    amount: Number(r.amount ?? 0),
    currency: (r.currency as Currency) ?? "ARS",
    status: (r.payment_status as PaymentStatus) ?? "pendiente",
    scheduled_date: (r.due_date as string) ?? "",
  }));
}

export interface ClientSummary extends Client {
  active_projects: number;
  billed_ars: number;
  billed_usd: number;
}

export async function clientSummaries(): Promise<ClientSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("v_client_summary").select("*");
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: r.client_id as string,
    name: r.name as string,
    industry: (r.industry as string | null) ?? null,
    status: ((r.status as "activo" | "inactivo") ?? "activo"),
    contact: (r.contact_name as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    preferred_currency: ((r.preferred_currency as Currency | null) ?? "ARS"),
    notes: null,
    is_active: r.status === "activo",
    created_at: r.created_at as string,
    active_projects: Number(r.active_projects ?? 0),
    billed_ars: Number(r.total_billed_ars ?? 0),
    billed_usd: Number(r.total_billed_usd ?? 0),
  }));
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

export async function profitabilityByProject(): Promise<Profitability[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("v_profitability").select("*");
  const rows = (data ?? []) as Record<string, unknown>[];
  const projects = await fetchProjects();
  return rows.map((r) => {
    const proj = projects.find((p) => p.id === r.project_id);
    return {
      project_id: r.project_id as string,
      project: (r.project_name as string) ?? "—",
      client: (r.client_name as string) ?? "—",
      income: Number(r.total_income ?? 0),
      expenses: Number(r.total_expenses ?? 0),
      net: Number(r.net_result ?? 0),
      margin: Number(r.margin_pct ?? 0),
      currency: proj?.currency ?? "ARS",
    };
  });
}

export async function profitabilityByClient() {
  const supabase = await createClient();
  const { data } = await supabase.from("v_profitability_by_client").select("*");
  const clients = await fetchClients();
  return ((data ?? []) as Record<string, unknown>[]).map((r) => {
    const cli = clients.find((c) => c.id === r.client_id);
    return {
      client_id: r.client_id as string,
      client: (r.client_name as string) ?? "—",
      projects: Number(r.project_count ?? 0),
      income: Number(r.total_income ?? 0),
      expenses: Number(r.total_expenses ?? 0),
      net: Number(r.net_result ?? 0),
      margin: Number(r.margin_pct ?? 0),
      currency: cli?.preferred_currency ?? "ARS",
    };
  });
}

export async function prospectsByStage() {
  const stages = [
    "contacto_inicial",
    "propuesta_enviada",
    "negociacion",
    "cerrado_ganado",
    "cerrado_perdido",
  ] as const;
  const all = await fetchProspects();
  return stages.map((s) => ({
    stage: s,
    items: all.filter((p) => p.stage === s),
  }));
}

export async function closeRate(): Promise<number> {
  const all = await fetchProspects();
  const won = all.filter((p) => p.stage === "cerrado_ganado").length;
  const lost = all.filter((p) => p.stage === "cerrado_perdido").length;
  const closed = won + lost;
  return closed === 0 ? 0 : (won / closed) * 100;
}

export async function recentActivity(limit: number = 5): Promise<AuditLog[]> {
  return fetchAuditLog(limit);
}

export type Currency = "ARS" | "USD";
export type ProjectPhase =
  | "descubrimiento"
  | "diseno"
  | "desarrollo"
  | "entrega"
  | "soporte"
  | "archivado";
export type ProjectStatus = "activo" | "pausado" | "completado" | "archivado";
export type TaskPriority = "baja" | "media" | "alta" | "urgente";
export type TaskStatus = "pendiente" | "en_progreso" | "completada";
export type PaymentStatus = "pendiente" | "cobrado" | "vencido";
export type ProspectStage =
  | "contacto_inicial"
  | "propuesta_enviada"
  | "negociacion"
  | "cerrado_ganado"
  | "cerrado_perdido";
export type AuditAction = "create" | "update" | "delete";
export type ServiceType = "proyecto" | "mensual" | "hora";
export type UserRole = "admin" | "colaborador";
export type AccountType = "bank" | "digital_wallet" | "cash" | "crypto" | "other";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string | null;
  is_active: boolean;
  color?: "ops" | "grow" | null;
  avatar_emoji?: string | null;
}

export interface Account {
  id: string;
  name: string;
  owner_user_id: string | null;
  type: AccountType;
  currency: Currency;
  is_active: boolean;
}

export interface Client {
  id: string;
  name: string;
  industry?: string | null;
  status: "activo" | "inactivo";
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  preferred_currency: Currency;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  phase: ProjectPhase;
  start_date?: string | null;
  end_date?: string | null;
  responsible_user_id?: string | null;
  total_amount: number;
  currency: Currency;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  completed_at?: string | null;
}

export interface Payment {
  id: string;
  project_id: string;
  description: string;
  amount: number;
  currency: Currency;
  due_date?: string | null;
  status: PaymentStatus;
  paid_at?: string | null;
  payment_method?: string | null;
  collected_by?: string | null;
  account_id?: string | null;
  notes?: string | null;
}

export interface Maintenance {
  id: string;
  project_id?: string | null;
  client_id: string;
  description: string;
  amount: number;
  currency: Currency;
  day_of_month: number;
  is_active: boolean;
}

export interface MaintenancePayment {
  id: string;
  maintenance_id: string;
  period_month: number;
  period_year: number;
  amount: number;
  currency: Currency;
  due_date: string;
  status: PaymentStatus;
  paid_at?: string | null;
  payment_method?: string | null;
  collected_by?: string | null;
  account_id?: string | null;
}

export interface Expense {
  id: string;
  name: string;
  category?: string | null;
  cost: number;
  currency: Currency;
  frequency: "mensual" | "anual" | "unico";
  next_due_date?: string | null;
  project_id?: string | null;
  client_id?: string | null;
  is_active: boolean;
}

export interface ExpensePayment {
  id: string;
  expense_id: string;
  amount: number;
  currency: Currency;
  paid_at: string;
  account_id?: string | null;
  paid_by?: string | null;
}

export interface Prospect {
  id: string;
  name: string;
  company?: string | null;
  origin?: string | null;
  stage: ProspectStage;
  responsible_user_id?: string | null;
  estimated_amount?: number | null;
  estimated_currency?: Currency | null;
  next_step?: string | null;
  next_step_date?: string | null;
  converted_client_id?: string | null;
  converted_project_id?: string | null;
  notes?: string | null;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price_ars?: number | null;
  price_usd?: number | null;
  type: ServiceType;
  estimated_delivery_days?: number | null;
  is_active: boolean;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  url: string;
  type: "figma" | "drive" | "repo" | "docs" | "otro";
  uploaded_by?: string | null;
  created_at: string;
}

export interface Decision {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  decided_at: string;
  decided_by: string;
  created_at: string;
}

export interface Communication {
  id: string;
  project_id?: string | null;
  client_id: string;
  subject?: string | null;
  content?: string | null;
  type: "email" | "whatsapp" | "llamada" | "reunion" | "otro";
  contacted_at: string;
  contacted_by: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  description?: string | null;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  milestone_date: string;
  auto_generated: boolean;
  created_by?: string | null;
  created_at: string;
}

export interface ProjectPhaseHistory {
  id: string;
  project_id: string;
  from_phase?: ProjectPhase | null;
  to_phase: ProjectPhase;
  changed_by: string;
  changed_at: string;
}

export interface BusinessSettings {
  id: string;
  name: string;
  razon_social?: string | null;
  cuit?: string | null;
  billing_address?: string | null;
  billing_data?: Record<string, unknown> | null;
}

export type ModuleColor = "ops" | "fin" | "grow";

export const PHASES: { key: ProjectPhase; label: string }[] = [
  { key: "descubrimiento", label: "Descubrimiento" },
  { key: "diseno", label: "Diseño" },
  { key: "desarrollo", label: "Desarrollo" },
  { key: "entrega", label: "Entrega" },
  { key: "soporte", label: "Soporte" },
  { key: "archivado", label: "Archivado" },
];

export const PROSPECT_STAGES: { key: ProspectStage; label: string }[] = [
  { key: "contacto_inicial", label: "Contacto inicial" },
  { key: "propuesta_enviada", label: "Propuesta enviada" },
  { key: "negociacion", label: "Negociación" },
  { key: "cerrado_ganado", label: "Cerrado ganado" },
  { key: "cerrado_perdido", label: "Cerrado perdido" },
];

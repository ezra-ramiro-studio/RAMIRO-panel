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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  color?: "ops" | "grow";
  avatar_emoji?: string;
}

export interface Account {
  id: string;
  name: string;
  owner_id: string;
  type: "banco" | "billetera_digital" | "efectivo" | "crypto" | "otro";
  currency: Currency;
  is_active: boolean;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  contact: string;
  phone: string;
  email: string;
  preferred_currency: Currency;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  start_date: string;
  end_date?: string;
  responsible_id: string;
  total_amount: number;
  currency: Currency;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  completed_at?: string;
}

export interface Payment {
  id: string;
  project_id: string;
  description: string;
  amount: number;
  currency: Currency;
  scheduled_date: string;
  status: PaymentStatus;
  paid_at?: string;
  payment_method?: string;
  collected_by?: string;
  account_id?: string;
}

export interface Maintenance {
  id: string;
  project_id: string;
  description: string;
  amount: number;
  currency: Currency;
  billing_day: number;
}

export interface MaintenancePayment {
  id: string;
  maintenance_id: string;
  period: string; // YYYY-MM
  scheduled_date: string;
  status: PaymentStatus;
  paid_at?: string;
  account_id?: string;
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  cost: number;
  currency: Currency;
  frequency: "mensual" | "anual" | "unico";
  next_due_date: string;
  project_id?: string;
  client_id?: string;
}

export interface Prospect {
  id: string;
  name: string;
  company?: string;
  source: "referido" | "redes" | "evento" | "contacto_directo";
  responsible_id: string;
  estimated_amount?: number;
  currency?: Currency;
  stage: ProspectStage;
  next_step?: string;
  next_step_date?: string;
  notes?: string;
  converted_client_id?: string;
  converted_project_id?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price_ars: number;
  price_usd: number;
  type: ServiceType;
  delivery_time?: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  url: string;
  type: "figma" | "drive" | "repo" | "docs" | "otro";
  uploaded_by: string;
  created_at: string;
}

export interface Decision {
  id: string;
  project_id: string;
  title: string;
  description: string;
  decided_by: string;
  created_at: string;
}

export interface Communication {
  id: string;
  project_id?: string;
  client_id: string;
  subject: string;
  content: string;
  type: "email" | "whatsapp" | "llamada" | "reunion" | "otro";
  contacted_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  description: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  created_at: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved_at: string;
  registered_by: string;
  auto_generated: boolean;
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

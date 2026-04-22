export interface DbAudit {
  id: string;
  created_at: string;
  timestamp: string;
  auditor: string | null;
  employee_name: string | null;  // Colaborador evaluado (para áreas con equipos)
  area: string;
  audit_type: string;
  responses: Record<string, string | number | boolean | null>;
  raw_score: number | null;
}

export type UserRole = "admin" | "leader" | "collaborator";

export interface DbEmployee {
  id: string;
  created_at: string;
  name: string;
  area: string;
  role: UserRole;
  email: string | null;
  is_active: boolean;
}

export interface DbLeader {
  id: string;
  created_at: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface DbArea {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  leader_id: string | null;
}

export type CompromiseStatus = "pending" | "in_progress" | "completed" | "blocked";

export interface DbCompromise {
  id: string;
  created_at: string;
  leader_id: string;
  description: string;
  estimated_date: string;
  status: CompromiseStatus;
  progress_notes: string | null;
  week_number: number | null;
  year: number | null;
}

export interface Database {
  public: {
    Tables: {
      audits: {
        Row: DbAudit;
        Insert: Omit<DbAudit, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbAudit, "id">>;
      };
      leaders: {
        Row: DbLeader;
        Insert: Omit<DbLeader, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbLeader, "id">>;
      };
      areas: {
        Row: DbArea;
        Insert: Omit<DbArea, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbArea, "id">>;
      };
      compromises: {
        Row: DbCompromise;
        Insert: Omit<DbCompromise, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<DbCompromise, "id">>;
      };
    };
  };
}

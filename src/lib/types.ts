
import type { SupabaseClient } from "@supabase/supabase-js";

export type TypedSupabaseClient = SupabaseClient<Database>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "admin" | "staff" | "client";
          organization_id: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role: "admin" | "staff" | "client";
          organization_id?: string | null;
          phone?: string | null;
        };
        Update: {
          full_name?: string | null;
          role?: "admin" | "staff" | "client";
          organization_id?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          name?: string;
        };
      };
      financial_records: {
        Row: {
          id: string;
          organization_id: string;
          uploaded_by: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          status: "pending" | "processing" | "completed" | "failed";
          risk_level: "low" | "medium" | "high" | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          uploaded_by: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          status?: "pending" | "processing" | "completed" | "failed";
        };
        Update: {
          status?: "pending" | "processing" | "completed" | "failed";
          risk_level?: "low" | "medium" | "high" | null;
        };
      };
      audit_reports: {
        Row: {
          id: string;
          organization_id: string;
          generated_by: string;
          title: string;
          recommendations: string | null;
          status: "draft" | "final";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          generated_by: string;
          title: string;
          recommendations?: string | null;
          status?: "draft" | "final";
        };
        Update: {
          title?: string;
          recommendations?: string | null;
          status?: "draft" | "final";
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          action: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          action: string;
          details?: Json | null;
        };
        Update: {};
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      role: "admin" | "staff" | "client";
      file_status: "pending" | "processing" | "completed" | "failed";
      report_status: "draft" | "final";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type FinancialRecord = Database["public"]["Tables"]["financial_records"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type AuditReport = Database["public"]["Tables"]["audit_reports"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];

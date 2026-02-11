import type { EventCategory } from './index';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          password_hash: string;
          organization_name: string;
          school_id: string | null;
          is_verified: boolean;
          is_admin: boolean;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username?: string | null;
          password_hash: string;
          organization_name: string;
          school_id?: string | null;
          is_verified?: boolean;
          is_admin?: boolean;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          password_hash?: string;
          organization_name?: string;
          school_id?: string | null;
          is_verified?: boolean;
          is_admin?: boolean;
          logo_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_school_id_fkey";
            columns: ["school_id"];
            isOneToOne: false;
            referencedRelation: "schools";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          location: string;
          category: EventCategory;
          custom_category: string | null;
          org_id: string | null;
          logo_url: string | null;
          video_url: string | null;
          thumbnail_url: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          location?: string;
          category?: EventCategory;
          custom_category?: string | null;
          org_id?: string | null;
          logo_url?: string | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          location?: string;
          category?: EventCategory;
          custom_category?: string | null;
          org_id?: string | null;
          logo_url?: string | null;
          video_url?: string | null;
          thumbnail_url?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      schools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          location: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          location?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          location?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          action: string;
          actor_id: string | null;
          actor_name: string | null;
          target_type: string | null;
          target_id: string | null;
          target_name: string | null;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          actor_id?: string | null;
          actor_name?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          target_name?: string | null;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          actor_id?: string | null;
          actor_name?: string | null;
          target_type?: string | null;
          target_id?: string | null;
          target_name?: string | null;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type DbUser = Database['public']['Tables']['users']['Row'];
export type DbEvent = Database['public']['Tables']['events']['Row'];
export type DbSchool = Database['public']['Tables']['schools']['Row'];
export type DbActivityLog = Database['public']['Tables']['activity_logs']['Row'];

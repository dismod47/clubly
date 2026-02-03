import type { EventCategory } from './index';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          organization_name: string;
          is_verified: boolean;
          is_admin: boolean;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          organization_name: string;
          is_verified?: boolean;
          is_admin?: boolean;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          organization_name?: string;
          is_verified?: boolean;
          is_admin?: boolean;
          logo_url?: string | null;
          created_at?: string;
        };
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
          is_approved?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

export type DbUser = Database['public']['Tables']['users']['Row'];
export type DbEvent = Database['public']['Tables']['events']['Row'];

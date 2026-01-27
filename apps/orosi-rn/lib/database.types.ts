export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export enum EventPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export type Database = {
  public: {
    Tables: {
      event_subtasks: {
        Row: {
          created_at: string | null;
          event_id: string;
          id: string;
          is_completed: boolean | null;
          order_index: number | null;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          event_id: string;
          id?: string;
          is_completed?: boolean | null;
          order_index?: number | null;
          title: string;
        };
        Update: {
          created_at?: string | null;
          event_id?: string;
          id?: string;
          is_completed?: boolean | null;
          order_index?: number | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_subtasks_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          color: string | null;
          created_at: string | null;
          description: string | null;
          end_time: string;
          id: string;
          is_all_day: boolean | null;
          priority: EventPriority | null;
          start_time: string;
          subtitle: string | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          end_time: string;
          id?: string;
          is_all_day?: boolean | null;
          priority?: EventPriority | null;
          start_time: string;
          subtitle?: string | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          description?: string | null;
          end_time?: string;
          id?: string;
          is_all_day?: boolean | null;
          priority?: EventPriority | null;
          start_time?: string;
          subtitle?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [];
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
};

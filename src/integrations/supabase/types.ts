export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      img_links: {
        Row: {
          created_at: string
          id: string
          img_id: string
          is_primary: boolean
          member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          img_id: string
          is_primary?: boolean
          member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          img_id?: string
          is_primary?: boolean
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "img_links_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          like_type: string
          sent_from: string
          sent_to: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          like_type?: string
          sent_from: string
          sent_to: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          like_type?: string
          sent_from?: string
          sent_to?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_sent_from_fkey"
            columns: ["sent_from"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_sent_to_fkey"
            columns: ["sent_to"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          about_me: string | null
          alcoholism: string
          birthdate: string
          confirmation_code: string
          confirmed: string
          created_at: string
          education_level: string
          email: string
          entry_date: string
          gender: string
          get_news: string
          having_kid: string
          height: string
          id: string
          last_activity: string
          location: string
          member_id: number
          name: string
          need_kids: string
          password: string
          preferred_age_from: string
          preferred_age_to: string
          professionalism: string
          reasons: string
          relationship_status: string
          remember_token: string
          reset_expires: string | null
          reset_token: string | null
          smoker: string
          status: string
          subscribed_at: string | null
          subscription: string
          subscription_id: string | null
          updated_at: string
          user_id: string | null
          weight: string
        }
        Insert: {
          about_me?: string | null
          alcoholism: string
          birthdate: string
          confirmation_code: string
          confirmed?: string
          created_at?: string
          education_level: string
          email: string
          entry_date?: string
          gender: string
          get_news?: string
          having_kid: string
          height: string
          id?: string
          last_activity?: string
          location: string
          member_id?: number
          name: string
          need_kids: string
          password: string
          preferred_age_from: string
          preferred_age_to: string
          professionalism: string
          reasons: string
          relationship_status: string
          remember_token?: string
          reset_expires?: string | null
          reset_token?: string | null
          smoker: string
          status?: string
          subscribed_at?: string | null
          subscription?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          weight: string
        }
        Update: {
          about_me?: string | null
          alcoholism?: string
          birthdate?: string
          confirmation_code?: string
          confirmed?: string
          created_at?: string
          education_level?: string
          email?: string
          entry_date?: string
          gender?: string
          get_news?: string
          having_kid?: string
          height?: string
          id?: string
          last_activity?: string
          location?: string
          member_id?: number
          name?: string
          need_kids?: string
          password?: string
          preferred_age_from?: string
          preferred_age_to?: string
          professionalism?: string
          reasons?: string
          relationship_status?: string
          remember_token?: string
          reset_expires?: string | null
          reset_token?: string | null
          smoker?: string
          status?: string
          subscribed_at?: string | null
          subscription?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          weight?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: string
          created_at: string
          delivered_at: string | null
          edited_at: string | null
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
          timestamp: string | null
        }
        Insert: {
          chat_id: string
          created_at?: string
          delivered_at?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
          timestamp?: string | null
        }
        Update: {
          chat_id?: string
          created_at?: string
          delivered_at?: string | null
          edited_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

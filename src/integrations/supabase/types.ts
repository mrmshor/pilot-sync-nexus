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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          added_by: string
          created_at: string
          id: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          id?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          created_by: string
          id: string
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string | null
          completed: boolean | null
          created_at: string
          created_by: string
          currency: string | null
          deadline: string | null
          description: string | null
          email: string | null
          folder_path: string | null
          icloud_link: string | null
          id: string
          name: string
          paid: boolean | null
          phone1: string | null
          phone2: string | null
          price: number | null
          priority: string
          status: string
          updated_at: string
          whatsapp1: string | null
          whatsapp2: string | null
        }
        Insert: {
          client_name?: string | null
          completed?: boolean | null
          created_at?: string
          created_by: string
          currency?: string | null
          deadline?: string | null
          description?: string | null
          email?: string | null
          folder_path?: string | null
          icloud_link?: string | null
          id?: string
          name: string
          paid?: boolean | null
          phone1?: string | null
          phone2?: string | null
          price?: number | null
          priority?: string
          status?: string
          updated_at?: string
          whatsapp1?: string | null
          whatsapp2?: string | null
        }
        Update: {
          client_name?: string | null
          completed?: boolean | null
          created_at?: string
          created_by?: string
          currency?: string | null
          deadline?: string | null
          description?: string | null
          email?: string | null
          folder_path?: string | null
          icloud_link?: string | null
          id?: string
          name?: string
          paid?: boolean | null
          phone1?: string | null
          phone2?: string | null
          price?: number | null
          priority?: string
          status?: string
          updated_at?: string
          whatsapp1?: string | null
          whatsapp2?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_client_data: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      get_project_safe_view: {
        Args: { p_project_id: string }
        Returns: {
          client_name: string
          completed: boolean
          created_at: string
          created_by: string
          currency: string
          deadline: string
          description: string
          email: string
          folder_path: string
          has_sensitive_access: boolean
          icloud_link: string
          id: string
          name: string
          paid: boolean
          phone1: string
          phone2: string
          price: number
          priority: string
          status: string
          updated_at: string
          whatsapp1: string
          whatsapp2: string
        }[]
      }
      get_user_projects: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_name: string
          completed: boolean
          created_at: string
          created_by: string
          currency: string
          deadline: string
          description: string
          email: string
          folder_path: string
          has_sensitive_access: boolean
          icloud_link: string
          id: string
          name: string
          paid: boolean
          phone1: string
          phone2: string
          price: number
          priority: string
          status: string
          updated_at: string
          whatsapp1: string
          whatsapp2: string
        }[]
      }
      has_project_role: {
        Args: { p_project_id: string; p_roles: string[]; p_user_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: boolean
      }
      shares_project_with: {
        Args: { p_current_user_id: string; p_target_user_id: string }
        Returns: boolean
      }
      update_project_secure: {
        Args: {
          p_client_name?: string
          p_completed?: boolean
          p_currency?: string
          p_deadline?: string
          p_description?: string
          p_email?: string
          p_folder_path?: string
          p_icloud_link?: string
          p_name?: string
          p_paid?: boolean
          p_phone1?: string
          p_phone2?: string
          p_price?: number
          p_priority?: string
          p_project_id: string
          p_status?: string
          p_whatsapp1?: string
          p_whatsapp2?: string
        }
        Returns: boolean
      }
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

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          badge: string | null
          category: string
          created_at: string
          description: string | null
          duration_min: number
          id: string
          is_active: boolean
          name: string
          price: number
          slug: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category: string
          created_at?: string
          description?: string | null
          duration_min?: number
          id?: string
          is_active?: boolean
          name: string
          price?: number
          slug: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category?: string
          created_at?: string
          description?: string | null
          duration_min?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          progress: number
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          progress?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          progress?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      department_responses: {
        Row: {
          attachments: Json
          created_at: string
          department_id: string
          id: string
          question_id: string
          score: number | null
          selected_label: string | null
          updated_at: string
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          attachments?: Json
          created_at?: string
          department_id: string
          id?: string
          question_id: string
          score?: number | null
          selected_label?: string | null
          updated_at?: string
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          attachments?: Json
          created_at?: string
          department_id?: string
          id?: string
          question_id?: string
          score?: number | null
          selected_label?: string | null
          updated_at?: string
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "department_responses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "org_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      org_departments: {
        Row: {
          access_token: string
          created_at: string
          id: string
          key: string
          name: string
          organisation_id: string
          respondent_email: string | null
          respondent_name: string | null
          respondent_role: string | null
          score: number | null
          section_id: string | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string
          created_at?: string
          id?: string
          key: string
          name: string
          organisation_id: string
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_role?: string | null
          score?: number | null
          section_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          id?: string
          key?: string
          name?: string
          organisation_id?: string
          respondent_email?: string | null
          respondent_name?: string | null
          respondent_role?: string | null
          score?: number | null
          section_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_departments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_departments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      org_reports: {
        Row: {
          ai_draft: Json
          approved_at: string | null
          approved_by: string | null
          created_at: string
          department_scores: Json
          edited: Json | null
          id: string
          metric_scores: Json
          organisation_id: string
          overall_score: number | null
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          ai_draft?: Json
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department_scores?: Json
          edited?: Json | null
          id?: string
          metric_scores?: Json
          organisation_id: string
          overall_score?: number | null
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          ai_draft?: Json
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department_scores?: Json
          edited?: Json | null
          id?: string
          metric_scores?: Json
          organisation_id?: string
          overall_score?: number | null
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "org_reports_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          assessment_id: string | null
          business_position: string | null
          company_size: string | null
          created_at: string
          current_level: number
          director_email: string | null
          director_id: string
          director_name: string | null
          director_phone: string | null
          id: string
          industry: string | null
          name: string
          objectives: string | null
          org_type: string | null
          process_confirmed_at: string | null
          status: string
          target_level: number
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          business_position?: string | null
          company_size?: string | null
          created_at?: string
          current_level?: number
          director_email?: string | null
          director_id: string
          director_name?: string | null
          director_phone?: string | null
          id?: string
          industry?: string | null
          name: string
          objectives?: string | null
          org_type?: string | null
          process_confirmed_at?: string | null
          status?: string
          target_level?: number
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          business_position?: string | null
          company_size?: string | null
          created_at?: string
          current_level?: number
          director_email?: string | null
          director_id?: string
          director_name?: string | null
          director_phone?: string | null
          id?: string
          industry?: string | null
          name?: string
          objectives?: string | null
          org_type?: string | null
          process_confirmed_at?: string | null
          status?: string
          target_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organisations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          assessment_id: string
          created_at: string
          currency: string
          id: string
          order_id: string | null
          payment_id: string | null
          provider: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          assessment_id: string
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payment_id?: string | null
          provider?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          assessment_id?: string
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payment_id?: string | null
          provider?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          code: string | null
          config: Json
          dimension: string | null
          icon: string | null
          id: string
          options: Json
          order_index: number
          required: boolean
          section_id: string
          text: string
          type: string
        }
        Insert: {
          code?: string | null
          config?: Json
          dimension?: string | null
          icon?: string | null
          id?: string
          options?: Json
          order_index?: number
          required?: boolean
          section_id: string
          text: string
          type?: string
        }
        Update: {
          code?: string | null
          config?: Json
          dimension?: string | null
          icon?: string | null
          id?: string
          options?: Json
          order_index?: number
          required?: boolean
          section_id?: string
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          action_plan: Json | null
          approved_at: string | null
          approved_by: string | null
          assessment_id: string
          attempt_id: string
          created_at: string
          dimension_scores: Json | null
          executive_summary: string | null
          gaps: Json | null
          growth_opportunity: string | null
          id: string
          overall_score: number
          root_causes: Json | null
          section_scores: Json
          status: string
          strengths: Json | null
          type_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_plan?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          assessment_id: string
          attempt_id: string
          created_at?: string
          dimension_scores?: Json | null
          executive_summary?: string | null
          gaps?: Json | null
          growth_opportunity?: string | null
          id?: string
          overall_score: number
          root_causes?: Json | null
          section_scores?: Json
          status?: string
          strengths?: Json | null
          type_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_plan?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          assessment_id?: string
          attempt_id?: string
          created_at?: string
          dimension_scores?: Json | null
          executive_summary?: string | null
          gaps?: Json | null
          growth_opportunity?: string | null
          id?: string
          overall_score?: number
          root_causes?: Json | null
          section_scores?: Json
          status?: string
          strengths?: Json | null
          type_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: true
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          attachments: Json
          attempt_id: string
          created_at: string
          id: string
          question_id: string
          score: number | null
          selected_label: string | null
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          attachments?: Json
          attempt_id: string
          created_at?: string
          id?: string
          question_id: string
          score?: number | null
          selected_label?: string | null
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          attachments?: Json
          attempt_id?: string
          created_at?: string
          id?: string
          question_id?: string
          score?: number | null
          selected_label?: string | null
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          assessment_id: string
          audience: string
          id: string
          name: string
          order_index: number
          slug: string
          weight: number
        }
        Insert: {
          assessment_id: string
          audience?: string
          id?: string
          name: string
          order_index?: number
          slug: string
          weight?: number
        }
        Update: {
          assessment_id?: string
          audience?: string
          id?: string
          name?: string
          order_index?: number
          slug?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "sections_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "consultant" | "client"
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
    Enums: {
      app_role: ["admin", "consultant", "client"],
    },
  },
} as const

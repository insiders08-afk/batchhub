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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          batch_id: string | null
          content: string
          created_at: string
          id: string
          institute_code: string
          posted_by: string
          posted_by_name: string | null
          title: string
          type: string | null
        }
        Insert: {
          batch_id?: string | null
          content: string
          created_at?: string
          id?: string
          institute_code: string
          posted_by: string
          posted_by_name?: string | null
          title: string
          type?: string | null
        }
        Update: {
          batch_id?: string | null
          content?: string
          created_at?: string
          id?: string
          institute_code?: string
          posted_by?: string
          posted_by_name?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          batch_id: string
          created_at: string
          date: string
          id: string
          institute_code: string
          marked_by: string | null
          present: boolean
          student_id: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          date?: string
          id?: string
          institute_code: string
          marked_by?: string | null
          present?: boolean
          student_id: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          date?: string
          id?: string
          institute_code?: string
          marked_by?: string | null
          present?: boolean
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          course: string
          created_at: string
          description: string | null
          id: string
          institute_code: string
          is_active: boolean
          name: string
          schedule: string | null
          teacher_id: string | null
          teacher_name: string | null
          updated_at: string
        }
        Insert: {
          course: string
          created_at?: string
          description?: string | null
          id?: string
          institute_code: string
          is_active?: boolean
          name: string
          schedule?: string | null
          teacher_id?: string | null
          teacher_name?: string | null
          updated_at?: string
        }
        Update: {
          course?: string
          created_at?: string
          description?: string | null
          id?: string
          institute_code?: string
          is_active?: boolean
          name?: string
          schedule?: string | null
          teacher_id?: string | null
          teacher_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fees: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          institute_code: string
          paid: boolean
          paid_date: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          institute_code: string
          paid?: boolean
          paid_date?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          institute_code?: string
          paid?: boolean
          paid_date?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      institutes: {
        Row: {
          attendance_marked_by: string
          city: string | null
          created_at: string
          email: string
          govt_registration_no: string
          id: string
          institute_code: string
          institute_name: string
          owner_name: string
          owner_user_id: string | null
          phone: string
          status: Database["public"]["Enums"]["institute_status"]
          updated_at: string
        }
        Insert: {
          attendance_marked_by?: string
          city?: string | null
          created_at?: string
          email: string
          govt_registration_no: string
          id?: string
          institute_code: string
          institute_name: string
          owner_name: string
          owner_user_id?: string | null
          phone: string
          status?: Database["public"]["Enums"]["institute_status"]
          updated_at?: string
        }
        Update: {
          attendance_marked_by?: string
          city?: string | null
          created_at?: string
          email?: string
          govt_registration_no?: string
          id?: string
          institute_code?: string
          institute_name?: string
          owner_name?: string
          owner_user_id?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["institute_status"]
          updated_at?: string
        }
        Relationships: []
      }
      pending_requests: {
        Row: {
          created_at: string
          email: string
          extra_data: Json | null
          full_name: string
          id: string
          institute_code: string
          review_note: string | null
          reviewed_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          extra_data?: Json | null
          full_name: string
          id?: string
          institute_code: string
          review_note?: string | null
          reviewed_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          extra_data?: Json | null
          full_name?: string
          id?: string
          institute_code?: string
          review_note?: string | null
          reviewed_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          institute_code: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          institute_code?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          institute_code?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      students_batches: {
        Row: {
          batch_id: string
          enrolled_at: string
          id: string
          institute_code: string
          student_id: string
        }
        Insert: {
          batch_id: string
          enrolled_at?: string
          id?: string
          institute_code: string
          student_id: string
        }
        Update: {
          batch_id?: string
          enrolled_at?: string
          id?: string
          institute_code?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_batches_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      test_scores: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          institute_code: string
          max_marks: number
          score: number
          student_id: string
          test_date: string
          test_name: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          institute_code: string
          max_marks?: number
          score?: number
          student_id: string
          test_date?: string
          test_name: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          institute_code?: string
          max_marks?: number
          score?: number
          student_id?: string
          test_date?: string
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_scores_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          city: string | null
          id: string
          institute_code: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          city?: string | null
          id?: string
          institute_code?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          city?: string | null
          id?: string
          institute_code?: string | null
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
      get_my_institute_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "teacher"
        | "student"
        | "parent"
        | "app_owner"
      institute_status: "pending" | "approved" | "rejected"
      user_status: "pending" | "approved" | "rejected" | "active"
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
      app_role: [
        "super_admin",
        "admin",
        "teacher",
        "student",
        "parent",
        "app_owner",
      ],
      institute_status: ["pending", "approved", "rejected"],
      user_status: ["pending", "approved", "rejected", "active"],
    },
  },
} as const

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
      audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          label: string | null
          person_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          person_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          person_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      change_requests: {
        Row: {
          created_at: string
          id: string
          person_id: string
          proposed_changes: Json
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          person_id: string
          proposed_changes?: Json
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          person_id?: string
          proposed_changes?: Json
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_requests_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      marriages: {
        Row: {
          created_at: string
          date_gregorian: string | null
          date_hijri: string | null
          husband_id: string
          id: string
          is_verified: boolean
          notes_ar: string | null
          notes_en: string | null
          order_num: number
          updated_at: string
          wife_id: string
        }
        Insert: {
          created_at?: string
          date_gregorian?: string | null
          date_hijri?: string | null
          husband_id: string
          id?: string
          is_verified?: boolean
          notes_ar?: string | null
          notes_en?: string | null
          order_num?: number
          updated_at?: string
          wife_id: string
        }
        Update: {
          created_at?: string
          date_gregorian?: string | null
          date_hijri?: string | null
          husband_id?: string
          id?: string
          is_verified?: boolean
          notes_ar?: string | null
          notes_en?: string | null
          order_num?: number
          updated_at?: string
          wife_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marriages_husband_id_fkey"
            columns: ["husband_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marriages_wife_id_fkey"
            columns: ["wife_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      persons: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          birth_city: string | null
          birth_country: string | null
          birth_date_gregorian: string | null
          birth_date_hijri: string | null
          branch: string | null
          created_at: string
          death_city: string | null
          death_country: string | null
          death_date_gregorian: string | null
          death_date_hijri: string | null
          father_id: string | null
          gender: string
          generation: number | null
          id: string
          is_living: boolean
          is_verified: boolean
          lat: number | null
          lng: number | null
          marriage_id: string | null
          mother_id: string | null
          name_ar: string
          name_en: string
          name_ur: string | null
          photo_url: string | null
          scholarly_tradition: string | null
          sources: Json
          titles: Json
          updated_at: string
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          birth_city?: string | null
          birth_country?: string | null
          birth_date_gregorian?: string | null
          birth_date_hijri?: string | null
          branch?: string | null
          created_at?: string
          death_city?: string | null
          death_country?: string | null
          death_date_gregorian?: string | null
          death_date_hijri?: string | null
          father_id?: string | null
          gender?: string
          generation?: number | null
          id?: string
          is_living?: boolean
          is_verified?: boolean
          lat?: number | null
          lng?: number | null
          marriage_id?: string | null
          mother_id?: string | null
          name_ar: string
          name_en: string
          name_ur?: string | null
          photo_url?: string | null
          scholarly_tradition?: string | null
          sources?: Json
          titles?: Json
          updated_at?: string
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          birth_city?: string | null
          birth_country?: string | null
          birth_date_gregorian?: string | null
          birth_date_hijri?: string | null
          branch?: string | null
          created_at?: string
          death_city?: string | null
          death_country?: string | null
          death_date_gregorian?: string | null
          death_date_hijri?: string | null
          father_id?: string | null
          gender?: string
          generation?: number | null
          id?: string
          is_living?: boolean
          is_verified?: boolean
          lat?: number | null
          lng?: number | null
          marriage_id?: string | null
          mother_id?: string | null
          name_ar?: string
          name_en?: string
          name_ur?: string | null
          photo_url?: string | null
          scholarly_tradition?: string | null
          sources?: Json
          titles?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persons_father_id_fkey"
            columns: ["father_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persons_marriage_id_fkey"
            columns: ["marriage_id"]
            isOneToOne: false
            referencedRelation: "marriages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persons_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          can_resubmit_after: string | null
          claimed_father_id: string | null
          full_name_ar: string
          full_name_en: string
          id: string
          proof_documents: Json
          rejection_reason: string | null
          reviewed_at: string | null
          status: string
          submitted_at: string
          user_id: string
          verifier_id: string | null
          verifier_notes: string | null
        }
        Insert: {
          can_resubmit_after?: string | null
          claimed_father_id?: string | null
          full_name_ar: string
          full_name_en: string
          id?: string
          proof_documents?: Json
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          user_id: string
          verifier_id?: string | null
          verifier_notes?: string | null
        }
        Update: {
          can_resubmit_after?: string | null
          claimed_father_id?: string | null
          full_name_ar?: string
          full_name_en?: string
          id?: string
          proof_documents?: Json
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
          verifier_id?: string | null
          verifier_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_claimed_father_id_fkey"
            columns: ["claimed_father_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_verifier_id_fkey"
            columns: ["verifier_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          linked_person_id: string | null
          preferred_locale: string
          role: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          linked_person_id?: string | null
          preferred_locale?: string
          role?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          linked_person_id?: string | null
          preferred_locale?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_linked_person_id_fkey"
            columns: ["linked_person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_persons: {
        Args: { branch_filter?: string; query: string; result_limit?: number }
        Returns: {
          bio_ar: string | null
          bio_en: string | null
          birth_city: string | null
          birth_country: string | null
          birth_date_gregorian: string | null
          birth_date_hijri: string | null
          branch: string | null
          created_at: string
          death_city: string | null
          death_country: string | null
          death_date_gregorian: string | null
          death_date_hijri: string | null
          father_id: string | null
          gender: string
          generation: number | null
          id: string
          is_living: boolean
          is_verified: boolean
          lat: number | null
          lng: number | null
          marriage_id: string | null
          mother_id: string | null
          name_ar: string
          name_en: string
          name_ur: string | null
          photo_url: string | null
          scholarly_tradition: string | null
          sources: Json
          titles: Json
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "persons"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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

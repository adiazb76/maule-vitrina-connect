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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      comunas: {
        Row: {
          created_at: string
          id: string
          name: string
          region: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          region?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          region?: string
          slug?: string
        }
        Relationships: []
      }
      entrepreneurs: {
        Row: {
          about: string | null
          business_name: string
          category_id: string | null
          collaboration_offering: string | null
          collaboration_seeking: string | null
          comuna_id: string | null
          contacts: number
          created_at: string
          email: string | null
          facebook: string | null
          featured: boolean
          id: string
          instagram: string | null
          logo_url: string | null
          owner_name: string
          phone: string | null
          photo_url: string | null
          short_description: string
          slug: string
          status: Database["public"]["Enums"]["entrepreneur_status"]
          tags: string[]
          updated_at: string
          user_id: string | null
          value_prop: string | null
          views: number
          website: string | null
          whatsapp: string | null
          whatsapp_message: string | null
        }
        Insert: {
          about?: string | null
          business_name: string
          category_id?: string | null
          collaboration_offering?: string | null
          collaboration_seeking?: string | null
          comuna_id?: string | null
          contacts?: number
          created_at?: string
          email?: string | null
          facebook?: string | null
          featured?: boolean
          id?: string
          instagram?: string | null
          logo_url?: string | null
          owner_name: string
          phone?: string | null
          photo_url?: string | null
          short_description?: string
          slug: string
          status?: Database["public"]["Enums"]["entrepreneur_status"]
          tags?: string[]
          updated_at?: string
          user_id?: string | null
          value_prop?: string | null
          views?: number
          website?: string | null
          whatsapp?: string | null
          whatsapp_message?: string | null
        }
        Update: {
          about?: string | null
          business_name?: string
          category_id?: string | null
          collaboration_offering?: string | null
          collaboration_seeking?: string | null
          comuna_id?: string | null
          contacts?: number
          created_at?: string
          email?: string | null
          facebook?: string | null
          featured?: boolean
          id?: string
          instagram?: string | null
          logo_url?: string | null
          owner_name?: string
          phone?: string | null
          photo_url?: string | null
          short_description?: string
          slug?: string
          status?: Database["public"]["Enums"]["entrepreneur_status"]
          tags?: string[]
          updated_at?: string
          user_id?: string | null
          value_prop?: string | null
          views?: number
          website?: string | null
          whatsapp?: string | null
          whatsapp_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entrepreneurs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrepreneurs_comuna_id_fkey"
            columns: ["comuna_id"]
            isOneToOne: false
            referencedRelation: "comunas"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          organizer: string | null
          published: boolean
          registration_url: string | null
          slug: string
          starts_at: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          organizer?: string | null
          published?: boolean
          registration_url?: string | null
          slug: string
          starts_at: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          organizer?: string | null
          published?: boolean
          registration_url?: string | null
          slug?: string
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          created_at: string
          entrepreneur_id: string
          id: string
          kind: string
        }
        Insert: {
          created_at?: string
          entrepreneur_id: string
          id?: string
          kind: string
        }
        Update: {
          created_at?: string
          entrepreneur_id?: string
          id?: string
          kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "entrepreneurs"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          entrepreneur_id: string
          id: string
          image_url: string | null
          info: string | null
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          entrepreneur_id: string
          id?: string
          image_url?: string | null
          info?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          entrepreneur_id?: string
          id?: string
          image_url?: string | null
          info?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "entrepreneurs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      radio_items: {
        Row: {
          description: string | null
          id: string
          image_url: string | null
          kind: string
          media_url: string | null
          published: boolean
          published_at: string
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          media_url?: string | null
          published?: boolean
          published_at?: string
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string | null
          kind?: string
          media_url?: string | null
          published?: boolean
          published_at?: string
          title?: string
        }
        Relationships: []
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
      weekly_features: {
        Row: {
          created_at: string
          entrepreneur_id: string
          id: string
          media_url: string | null
          story: string | null
          week_start: string
        }
        Insert: {
          created_at?: string
          entrepreneur_id: string
          id?: string
          media_url?: string | null
          story?: string | null
          week_start: string
        }
        Update: {
          created_at?: string
          entrepreneur_id?: string
          id?: string
          media_url?: string | null
          story?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_features_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "entrepreneurs"
            referencedColumns: ["id"]
          },
        ]
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
      log_interaction: {
        Args: { _entrepreneur_id: string; _kind: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "emprendedor"
      entrepreneur_status: "pendiente" | "aprobado" | "rechazado"
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
      app_role: ["admin", "emprendedor"],
      entrepreneur_status: ["pendiente", "aprobado", "rechazado"],
    },
  },
} as const

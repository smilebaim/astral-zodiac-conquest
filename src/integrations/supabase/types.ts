export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      battles: {
        Row: {
          arrival_time: string
          attacker_army: Json
          attacker_id: string
          created_at: string | null
          defender_army: Json | null
          defender_id: string
          id: string
          result: Json | null
          start_time: string | null
          status: string | null
        }
        Insert: {
          arrival_time: string
          attacker_army: Json
          attacker_id: string
          created_at?: string | null
          defender_army?: Json | null
          defender_id: string
          id?: string
          result?: Json | null
          start_time?: string | null
          status?: string | null
        }
        Update: {
          arrival_time?: string
          attacker_army?: Json
          attacker_id?: string
          created_at?: string | null
          defender_army?: Json | null
          defender_id?: string
          id?: string
          result?: Json | null
          start_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battles_attacker_id_fkey"
            columns: ["attacker_id"]
            isOneToOne: false
            referencedRelation: "kingdoms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battles_defender_id_fkey"
            columns: ["defender_id"]
            isOneToOne: false
            referencedRelation: "kingdoms"
            referencedColumns: ["id"]
          },
        ]
      }
      council_members: {
        Row: {
          council_id: string
          id: string
          joined_at: string | null
          kingdom_id: string
          role: string | null
        }
        Insert: {
          council_id: string
          id?: string
          joined_at?: string | null
          kingdom_id: string
          role?: string | null
        }
        Update: {
          council_id?: string
          id?: string
          joined_at?: string | null
          kingdom_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "council_members_council_id_fkey"
            columns: ["council_id"]
            isOneToOne: false
            referencedRelation: "councils"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "council_members_kingdom_id_fkey"
            columns: ["kingdom_id"]
            isOneToOne: false
            referencedRelation: "kingdoms"
            referencedColumns: ["id"]
          },
        ]
      }
      councils: {
        Row: {
          created_at: string | null
          id: string
          name: string
          resources: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          resources?: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          resources?: Json
        }
        Relationships: []
      }
      kingdoms: {
        Row: {
          army: Json
          buildings: Json
          created_at: string | null
          id: string
          last_update: string | null
          name: string
          research: Json
          resources: Json
          status: string | null
          user_id: string
          zodiac: string | null
        }
        Insert: {
          army?: Json
          buildings?: Json
          created_at?: string | null
          id?: string
          last_update?: string | null
          name: string
          research?: Json
          resources?: Json
          status?: string | null
          user_id: string
          zodiac?: string | null
        }
        Update: {
          army?: Json
          buildings?: Json
          created_at?: string | null
          id?: string
          last_update?: string | null
          name?: string
          research?: Json
          resources?: Json
          status?: string | null
          user_id?: string
          zodiac?: string | null
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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
      bairros_taxas: {
        Row: {
          created_at: string
          id: string
          nome: string
          taxa: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          taxa?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          taxa?: number
          user_id?: string
        }
        Relationships: []
      }
      comandas: {
        Row: {
          bairro: string
          created_at: string | null
          data: string | null
          endereco: string
          forma_pagamento: string
          id: string
          order_date: string
          pagamento_misto: Json | null
          pago: boolean | null
          produtos: Json
          quantiapaga: number | null
          taxaentrega: number
          total: number
          troco: number | null
          user_id: string
          valor_cartao: number | null
          valor_dinheiro: number | null
          valor_pix: number | null
        }
        Insert: {
          bairro: string
          created_at?: string | null
          data?: string | null
          endereco: string
          forma_pagamento: string
          id?: string
          order_date?: string
          pagamento_misto?: Json | null
          pago?: boolean | null
          produtos: Json
          quantiapaga?: number | null
          taxaentrega: number
          total: number
          troco?: number | null
          user_id: string
          valor_cartao?: number | null
          valor_dinheiro?: number | null
          valor_pix?: number | null
        }
        Update: {
          bairro?: string
          created_at?: string | null
          data?: string | null
          endereco?: string
          forma_pagamento?: string
          id?: string
          order_date?: string
          pagamento_misto?: Json | null
          pago?: boolean | null
          produtos?: Json
          quantiapaga?: number | null
          taxaentrega?: number
          total?: number
          troco?: number | null
          user_id?: string
          valor_cartao?: number | null
          valor_dinheiro?: number | null
          valor_pix?: number | null
        }
        Relationships: []
      }
      delivery: {
        Row: {
          comanda_ids: string[]
          created_at: string | null
          delivery_value: number
          id: string
          motoboy_id: string
          platform: string
          status: string
        }
        Insert: {
          comanda_ids: string[]
          created_at?: string | null
          delivery_value?: number
          id?: string
          motoboy_id: string
          platform: string
          status?: string
        }
        Update: {
          comanda_ids?: string[]
          created_at?: string | null
          delivery_value?: number
          id?: string
          motoboy_id?: string
          platform?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_motoboy_id_fkey"
            columns: ["motoboy_id"]
            isOneToOne: false
            referencedRelation: "motoboys"
            referencedColumns: ["id"]
          },
        ]
      }
      entregas: {
        Row: {
          bairro: string
          comanda_id: string | null
          created_at: string | null
          data: string | null
          endereco: string
          id: string
          motoboy_id: string
          origem: string
          status: string | null
          user_id: string
          valor_entrega: number
        }
        Insert: {
          bairro: string
          comanda_id?: string | null
          created_at?: string | null
          data?: string | null
          endereco: string
          id?: string
          motoboy_id: string
          origem: string
          status?: string | null
          user_id: string
          valor_entrega?: number
        }
        Update: {
          bairro?: string
          comanda_id?: string | null
          created_at?: string | null
          data?: string | null
          endereco?: string
          id?: string
          motoboy_id?: string
          origem?: string
          status?: string | null
          user_id?: string
          valor_entrega?: number
        }
        Relationships: [
          {
            foreignKeyName: "entregas_comanda_id_fkey"
            columns: ["comanda_id"]
            isOneToOne: false
            referencedRelation: "comandas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_motoboy_id_fkey"
            columns: ["motoboy_id"]
            isOneToOne: false
            referencedRelation: "motoboys"
            referencedColumns: ["id"]
          },
        ]
      }
      motoboys: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          placa: string | null
          status: string | null
          telefone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          placa?: string | null
          status?: string | null
          telefone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          placa?: string | null
          status?: string | null
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          categoria: string | null
          created_at: string | null
          id: string
          nome: string
          numero: number | null
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome: string
          numero?: number | null
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          numero?: number | null
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          show_values: boolean | null
          store_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          show_values?: boolean | null
          store_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          show_values?: boolean | null
          store_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shop_sessions: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          start_time?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          start_time?: string
          user_id?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
          is_default: boolean | null
          nome: string
          taxa: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          nome: string
          taxa?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
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
      device_tokens: {
        Row: {
          app_version: string | null
          ativo: boolean | null
          created_at: string | null
          device_info: Json | null
          id: string
          last_seen: string | null
          platform: string | null
          token: string
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          ativo?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          id?: string
          last_seen?: string | null
          platform?: string | null
          token: string
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          ativo?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          id?: string
          last_seen?: string | null
          platform?: string | null
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      entregas: {
        Row: {
          bairro: string
          comanda_id: string | null
          created_at: string | null
          data: string | null
          forma_pagamento: string | null
          id: string
          motoboy_id: string
          origem: string
          pago: string | null
          status: string | null
          user_id: string
          valor_entrega: number
          valor_pedido: number | null
        }
        Insert: {
          bairro: string
          comanda_id?: string | null
          created_at?: string | null
          data?: string | null
          forma_pagamento?: string | null
          id?: string
          motoboy_id: string
          origem: string
          pago?: string | null
          status?: string | null
          user_id: string
          valor_entrega?: number
          valor_pedido?: number | null
        }
        Update: {
          bairro?: string
          comanda_id?: string | null
          created_at?: string | null
          data?: string | null
          forma_pagamento?: string | null
          id?: string
          motoboy_id?: string
          origem?: string
          pago?: string | null
          status?: string | null
          user_id?: string
          valor_entrega?: number
          valor_pedido?: number | null
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
      motoboy_sessions: {
        Row: {
          end_time: string | null
          id: string
          motoboy_id: string
          start_time: string
          user_id: string
        }
        Insert: {
          end_time?: string | null
          id?: string
          motoboy_id: string
          start_time?: string
          user_id: string
        }
        Update: {
          end_time?: string | null
          id?: string
          motoboy_id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_motoboy"
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
          entregas_para_desconto: number | null
          id: string
          nome: string
          placa: string | null
          status: string | null
          taxa_comissao: number | null
          telefone: string | null
          tipo_pagamento: string | null
          user_id: string
          valor_desconto_entrega: number | null
          valor_fixo_sessao: number | null
        }
        Insert: {
          created_at?: string | null
          entregas_para_desconto?: number | null
          id?: string
          nome: string
          placa?: string | null
          status?: string | null
          taxa_comissao?: number | null
          telefone?: string | null
          tipo_pagamento?: string | null
          user_id: string
          valor_desconto_entrega?: number | null
          valor_fixo_sessao?: number | null
        }
        Update: {
          created_at?: string | null
          entregas_para_desconto?: number | null
          id?: string
          nome?: string
          placa?: string | null
          status?: string | null
          taxa_comissao?: number | null
          telefone?: string | null
          tipo_pagamento?: string | null
          user_id?: string
          valor_desconto_entrega?: number | null
          valor_fixo_sessao?: number | null
        }
        Relationships: []
      }
      notification_campaigns: {
        Row: {
          agendada_para: string | null
          created_at: string | null
          criada_por: string
          descricao: string | null
          estatisticas: Json | null
          id: string
          nome: string
          notification_template: Json
          segment_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agendada_para?: string | null
          created_at?: string | null
          criada_por: string
          descricao?: string | null
          estatisticas?: Json | null
          id?: string
          nome: string
          notification_template: Json
          segment_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agendada_para?: string | null
          created_at?: string | null
          criada_por?: string
          descricao?: string | null
          estatisticas?: Json | null
          id?: string
          nome?: string
          notification_template?: Json
          segment_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_campaigns_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "user_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_tracking: {
        Row: {
          created_at: string | null
          device_token: string | null
          device_token_id: string
          entregue_em: string | null
          enviada_em: string | null
          erro_detalhes: string | null
          id: string
          notification_id: string
          status: string | null
          tentativas: number | null
          visualizada_em: string | null
        }
        Insert: {
          created_at?: string | null
          device_token?: string | null
          device_token_id: string
          entregue_em?: string | null
          enviada_em?: string | null
          erro_detalhes?: string | null
          id?: string
          notification_id: string
          status?: string | null
          tentativas?: number | null
          visualizada_em?: string | null
        }
        Update: {
          created_at?: string | null
          device_token?: string | null
          device_token_id?: string
          entregue_em?: string | null
          enviada_em?: string | null
          erro_detalhes?: string | null
          id?: string
          notification_id?: string
          status?: string | null
          tentativas?: number | null
          visualizada_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_tracking_device_token_id_fkey"
            columns: ["device_token_id"]
            isOneToOne: false
            referencedRelation: "device_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_tracking_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          agendada_para: string | null
          created_at: string | null
          criada_por: string
          dados_extras: Json | null
          enviada_em: string | null
          id: string
          mensagem: string
          prioridade: string | null
          status: string | null
          tipo: string
          titulo: string
          total_dispositivos: number | null
          total_enviadas: number | null
          total_falhadas: number | null
          total_visualizadas: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agendada_para?: string | null
          created_at?: string | null
          criada_por: string
          dados_extras?: Json | null
          enviada_em?: string | null
          id?: string
          mensagem: string
          prioridade?: string | null
          status?: string | null
          tipo: string
          titulo: string
          total_dispositivos?: number | null
          total_enviadas?: number | null
          total_falhadas?: number | null
          total_visualizadas?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agendada_para?: string | null
          created_at?: string | null
          criada_por?: string
          dados_extras?: Json | null
          enviada_em?: string | null
          id?: string
          mensagem?: string
          prioridade?: string | null
          status?: string | null
          tipo?: string
          titulo?: string
          total_dispositivos?: number | null
          total_enviadas?: number | null
          total_falhadas?: number | null
          total_visualizadas?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cash_amount: number | null
          created_at: string | null
          customer_address: string | null
          customer_name: string
          customer_neighborhood: string | null
          customer_notes: string | null
          customer_phone: string | null
          delivery_option: string
          id: string
          items: Json
          payment_method: string
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cash_amount?: number | null
          created_at?: string | null
          customer_address?: string | null
          customer_name: string
          customer_neighborhood?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          delivery_option: string
          id?: string
          items: Json
          payment_method: string
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cash_amount?: number | null
          created_at?: string | null
          customer_address?: string | null
          customer_name?: string
          customer_neighborhood?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          delivery_option?: string
          id?: string
          items?: Json
          payment_method?: string
          total?: number
          updated_at?: string | null
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
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          locked_until: string | null
          login_attempts: number | null
          phone: string | null
          print_size: string | null
          show_values: boolean | null
          status: string | null
          store_name: string | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          phone?: string | null
          print_size?: string | null
          show_values?: boolean | null
          status?: string | null
          store_name?: string | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          phone?: string | null
          print_size?: string | null
          show_values?: boolean | null
          status?: string | null
          store_name?: string | null
          theme?: string | null
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
      system_logs: {
        Row: {
          created_at: string | null
          detalhes: Json | null
          evento: string
          id: string
          ip_address: string | null
          nivel: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          detalhes?: Json | null
          evento: string
          id?: string
          ip_address?: string | null
          nivel?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          detalhes?: Json | null
          evento?: string
          id?: string
          ip_address?: string | null
          nivel?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_category: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_category?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_category?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      user_notification_reads: {
        Row: {
          created_at: string
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          reason: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_segments: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          criado_por: string
          criterios: Json
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          criado_por: string
          criterios?: Json
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          criado_por?: string
          criterios?: Json
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_session_data: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          session_data: Json
          session_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_data?: Json
          session_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_data?: Json
          session_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          show_payment_values: boolean | null
          user_id: string
        }
        Insert: {
          show_payment_values?: boolean | null
          user_id: string
        }
        Update: {
          show_payment_values?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings_new: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_new_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ui_state: {
        Row: {
          created_at: string
          id: string
          state_key: string
          state_value: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          state_key: string
          state_value?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          state_key?: string
          state_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ban_user: {
        Args: { target_user_id: string; ban_reason?: string }
        Returns: undefined
      }
      calculate_notification_stats: {
        Args: { notification_uuid: string }
        Returns: undefined
      }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_authorized_admin_email: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      promote_to_admin: {
        Args: { target_user_id: string; promotion_reason?: string }
        Returns: undefined
      }
      reactivate_user: {
        Args: { target_user_id: string; reactivation_reason?: string }
        Returns: undefined
      }
      search_comandas_by_last_8: {
        Args: Record<PropertyKey, never> | { search_term: string }
        Returns: {
          id: string
          bairro: string
          taxaentrega: number
          total: number
          quantiapaga: number
          forma_pagamento: string
          troco: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      soft_delete_user: {
        Args: { target_user_id: string; delete_reason?: string }
        Returns: undefined
      }
      suspend_user: {
        Args: { target_user_id: string; suspend_reason?: string; days?: number }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "user" | "banned" | "suspended"
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
    Enums: {
      user_role: ["admin", "user", "banned", "suspended"],
    },
  },
} as const

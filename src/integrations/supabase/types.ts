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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          cor: string | null
          created_at: string
          icone: string | null
          id: string
          nome: string
          tipo: string
          user_id: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          tipo: string
          user_id: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      contas: {
        Row: {
          conta: string
          created_at: string
          data_pagamento: string | null
          id: string
          mes: string
          pago: boolean
          responsavel: string
          user_id: string
          valor: number
          vencimento: string
        }
        Insert: {
          conta: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          mes: string
          pago?: boolean
          responsavel: string
          user_id: string
          valor: number
          vencimento: string
        }
        Update: {
          conta?: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          mes?: string
          pago?: boolean
          responsavel?: string
          user_id?: string
          valor?: number
          vencimento?: string
        }
        Relationships: []
      }
      entradas: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string
          id: string
          mes: string
          responsavel: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data?: string
          descricao: string
          id?: string
          mes: string
          responsavel: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          mes?: string
          responsavel?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      estoque: {
        Row: {
          categoria: string
          created_at: string
          custo_medio: number
          estoque_minimo: number
          id: string
          nome: string
          quantidade: number
          unidade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          custo_medio?: number
          estoque_minimo?: number
          id?: string
          nome: string
          quantidade?: number
          unidade?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          custo_medio?: number
          estoque_minimo?: number
          id?: string
          nome?: string
          quantidade?: number
          unidade?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financeiro_confeitaria: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string
          id: string
          nota_fiscal_id: string | null
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data?: string
          descricao: string
          id?: string
          nota_fiscal_id?: string | null
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          nota_fiscal_id?: string | null
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_confeitaria_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          user_id: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          user_id: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gastos: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string
          id: string
          mes: string
          pago: boolean
          responsavel: string
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          data?: string
          descricao: string
          id?: string
          mes: string
          pago?: boolean
          responsavel: string
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          mes?: string
          pago?: boolean
          responsavel?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      ingredientes_receita: {
        Row: {
          created_at: string
          estoque_id: string
          id: string
          quantidade: number
          receita_id: string
          unidade: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estoque_id: string
          id?: string
          quantidade: number
          receita_id: string
          unidade: string
          user_id: string
        }
        Update: {
          created_at?: string
          estoque_id?: string
          id?: string
          quantidade?: number
          receita_id?: string
          unidade?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredientes_receita_estoque_id_fkey"
            columns: ["estoque_id"]
            isOneToOne: false
            referencedRelation: "estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredientes_receita_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "receitas_confeitaria"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_nota_fiscal: {
        Row: {
          created_at: string
          estoque_id: string | null
          id: string
          nome_produto: string
          nota_fiscal_id: string
          quantidade: number
          status: string
          user_id: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          estoque_id?: string | null
          id?: string
          nome_produto: string
          nota_fiscal_id: string
          quantidade: number
          status?: string
          user_id: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string
          estoque_id?: string | null
          id?: string
          nome_produto?: string
          nota_fiscal_id?: string
          quantidade?: number
          status?: string
          user_id?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_nota_fiscal_estoque_id_fkey"
            columns: ["estoque_id"]
            isOneToOne: false
            referencedRelation: "estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_nota_fiscal_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      lista_compras: {
        Row: {
          categoria: string
          comprado: boolean
          created_at: string
          data: string
          foto_url: string | null
          id: string
          loja: string | null
          observacao: string | null
          preco: number | null
          produto: string
          quantidade: number
          unidade: string | null
          user_id: string
        }
        Insert: {
          categoria?: string
          comprado?: boolean
          created_at?: string
          data?: string
          foto_url?: string | null
          id?: string
          loja?: string | null
          observacao?: string | null
          preco?: number | null
          produto: string
          quantidade?: number
          unidade?: string | null
          user_id: string
        }
        Update: {
          categoria?: string
          comprado?: boolean
          created_at?: string
          data?: string
          foto_url?: string | null
          id?: string
          loja?: string | null
          observacao?: string | null
          preco?: number | null
          produto?: string
          quantidade?: number
          unidade?: string | null
          user_id?: string
        }
        Relationships: []
      }
      metas: {
        Row: {
          categoria: string | null
          created_at: string
          id: string
          mes: string
          nome: string
          responsavel: string
          tipo: string
          user_id: string
          valor_meta: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          id?: string
          mes: string
          nome: string
          responsavel: string
          tipo: string
          user_id: string
          valor_meta: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          id?: string
          mes?: string
          nome?: string
          responsavel?: string
          tipo?: string
          user_id?: string
          valor_meta?: number
        }
        Relationships: []
      }
      movimentacao_estoque: {
        Row: {
          created_at: string
          custo_unitario: number | null
          data: string
          estoque_id: string
          fornecedor_id: string | null
          id: string
          nota_fiscal_id: string | null
          observacao: string | null
          quantidade: number
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custo_unitario?: number | null
          data?: string
          estoque_id: string
          fornecedor_id?: string | null
          id?: string
          nota_fiscal_id?: string | null
          observacao?: string | null
          quantidade: number
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          custo_unitario?: number | null
          data?: string
          estoque_id?: string
          fornecedor_id?: string | null
          id?: string
          nota_fiscal_id?: string | null
          observacao?: string | null
          quantidade?: number
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacao_estoque_estoque_id_fkey"
            columns: ["estoque_id"]
            isOneToOne: false
            referencedRelation: "estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacao_estoque_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacao_nota_fk"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          cnpj_emitente: string | null
          created_at: string
          data_emissao: string | null
          fornecedor_id: string | null
          id: string
          imagem_url: string | null
          nome_emitente: string | null
          numero: string | null
          status: string
          user_id: string
          valor_total: number
        }
        Insert: {
          cnpj_emitente?: string | null
          created_at?: string
          data_emissao?: string | null
          fornecedor_id?: string | null
          id?: string
          imagem_url?: string | null
          nome_emitente?: string | null
          numero?: string | null
          status?: string
          user_id: string
          valor_total?: number
        }
        Update: {
          cnpj_emitente?: string | null
          created_at?: string
          data_emissao?: string | null
          fornecedor_id?: string | null
          id?: string
          imagem_url?: string | null
          nome_emitente?: string | null
          numero?: string | null
          status?: string
          user_id?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos_venda: {
        Row: {
          ativo: boolean
          created_at: string
          custo_total: number
          id: string
          margem_lucro: number
          nome: string
          preco_venda: number
          receita_id: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          custo_total?: number
          id?: string
          margem_lucro?: number
          nome: string
          preco_venda?: number
          receita_id?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          custo_total?: number
          id?: string
          margem_lucro?: number
          nome?: string
          preco_venda?: number
          receita_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_venda_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "receitas_confeitaria"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receitas_confeitaria: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          rendimento: number
          tempo_preparo: string | null
          unidade_rendimento: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          rendimento?: number
          tempo_preparo?: string | null
          unidade_rendimento?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          rendimento?: number
          tempo_preparo?: string | null
          unidade_rendimento?: string
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

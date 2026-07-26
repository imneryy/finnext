export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string;
          usuario_id: string;
          nome: string;
          descricao: string | null;
          cor: string;
          ordem: number;
          ativo: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          nome: string;
          descricao?: string | null;
          cor?: string;
          ordem?: number;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          nome?: string;
          descricao?: string | null;
          cor?: string;
          ordem?: number;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      subcategorias: {
        Row: {
          id: string;
          usuario_id: string;
          categoria_id: string;
          nome: string;
          descricao: string | null;
          ativo: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          categoria_id: string;
          nome: string;
          descricao?: string | null;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          categoria_id?: string;
          nome?: string;
          descricao?: string | null;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subcategorias_categoria_id_fkey";
            columns: ["categoria_id"];
            isOneToOne: false;
            referencedRelation: "categorias";
            referencedColumns: ["id"];
          },
        ];
      };
      lancamentos: {
        Row: {
          id: string;
          usuario_id: string;
          subcategoria_id: string | null;
          tipo: "receita" | "despesa";
          origem: "fixa" | "extra";
          valor: string;
          data: string;
          descricao: string;
          tags: string[];
          ativo: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          subcategoria_id?: string | null;
          tipo: "receita" | "despesa";
          origem: "fixa" | "extra";
          valor: string | number;
          data: string;
          descricao: string;
          tags?: string[];
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          subcategoria_id?: string | null;
          tipo?: "receita" | "despesa";
          origem?: "fixa" | "extra";
          valor?: string | number;
          data?: string;
          descricao?: string;
          tags?: string[];
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lancamentos_subcategoria_id_fkey";
            columns: ["subcategoria_id"];
            isOneToOne: false;
            referencedRelation: "subcategorias";
            referencedColumns: ["id"];
          },
        ];
      };
      receitas_base: {
        Row: {
          id: string;
          usuario_id: string;
          mes: number;
          ano: number;
          receita_base: string;
          ativo: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          mes: number;
          ano: number;
          receita_base?: string | number;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          mes?: number;
          ano?: number;
          receita_base?: string | number;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      orcamentos: {
        Row: {
          id: string;
          usuario_id: string;
          subcategoria_id: string;
          mes: number;
          ano: number;
          valor_planejado: string;
          valor_gasto: string;
          ativo: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          subcategoria_id: string;
          mes: number;
          ano: number;
          valor_planejado?: string | number;
          valor_gasto?: string | number;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          subcategoria_id?: string;
          mes?: number;
          ano?: number;
          valor_planejado?: string | number;
          valor_gasto?: string | number;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orcamentos_subcategoria_id_fkey";
            columns: ["subcategoria_id"];
            isOneToOne: false;
            referencedRelation: "subcategorias";
            referencedColumns: ["id"];
          },
        ];
      };
      preferencias_usuario: {
        Row: {
          usuario_id: string;
          nome_completo: string | null;
          onboarding_concluido: boolean;
          resumo_mensal_email: boolean;
          alerta_orcamento_email: boolean;
          alerta_orcamento_percentual: number;
          atualizado_em: string;
          criado_em: string;
        };
        Insert: {
          usuario_id: string;
          nome_completo?: string | null;
          onboarding_concluido?: boolean;
          resumo_mensal_email?: boolean;
          alerta_orcamento_email?: boolean;
          alerta_orcamento_percentual?: number;
          atualizado_em?: string;
          criado_em?: string;
        };
        Update: {
          usuario_id?: string;
          nome_completo?: string | null;
          onboarding_concluido?: boolean;
          resumo_mensal_email?: boolean;
          alerta_orcamento_email?: boolean;
          alerta_orcamento_percentual?: number;
          atualizado_em?: string;
          criado_em?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      criar_categorias_padrao: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      recalcular_valor_gasto: {
        Args: {
          p_mes: number;
          p_ano: number;
        };
        Returns: undefined;
      };
      salvar_orcamento_mensal: {
        Args: {
          p_mes: number;
          p_ano: number;
          p_receita_base: number | string;
          p_alocacoes: Json;
        };
        Returns: undefined;
      };
      duplicar_orcamento_mensal: {
        Args: {
          p_mes_origem: number;
          p_ano_origem: number;
          p_mes_destino: number;
          p_ano_destino: number;
        };
        Returns: undefined;
      };
      relatorio_resumo: {
        Args: {
          p_data_inicio: string;
          p_data_fim: string;
        };
        Returns: {
          total_receitas: string;
          total_despesas: string;
          saldo_liquido: string;
        }[];
      };
      relatorio_despesas_por_categoria: {
        Args: {
          p_data_inicio: string;
          p_data_fim: string;
        };
        Returns: {
          categoria_id: string | null;
          categoria_nome: string;
          total_despesas: string;
        }[];
      };
      relatorio_orcamento_realizado: {
        Args: {
          p_mes: number;
          p_ano: number;
        };
        Returns: {
          categoria_nome: string;
          subcategoria_nome: string;
          valor_planejado: string;
          valor_gasto: string;
          saldo: string;
          percentual_usado: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

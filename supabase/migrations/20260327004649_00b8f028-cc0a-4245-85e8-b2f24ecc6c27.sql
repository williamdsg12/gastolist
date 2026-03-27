
-- Fornecedores
CREATE TABLE public.fornecedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  cnpj text,
  telefone text,
  email text,
  endereco text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own fornecedores" ON public.fornecedores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Estoque
CREATE TABLE public.estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  quantidade numeric NOT NULL DEFAULT 0,
  unidade text NOT NULL DEFAULT 'un',
  custo_medio numeric NOT NULL DEFAULT 0,
  estoque_minimo numeric NOT NULL DEFAULT 0,
  categoria text NOT NULL DEFAULT 'Geral',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own estoque" ON public.estoque FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Movimentacao Estoque
CREATE TABLE public.movimentacao_estoque (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  estoque_id uuid REFERENCES public.estoque(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL,
  quantidade numeric NOT NULL,
  custo_unitario numeric DEFAULT 0,
  fornecedor_id uuid REFERENCES public.fornecedores(id),
  nota_fiscal_id uuid,
  observacao text,
  data timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.movimentacao_estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own movimentacao" ON public.movimentacao_estoque FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notas Fiscais
CREATE TABLE public.notas_fiscais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fornecedor_id uuid REFERENCES public.fornecedores(id),
  numero text,
  cnpj_emitente text,
  nome_emitente text,
  data_emissao date,
  valor_total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'processada',
  imagem_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notas" ON public.notas_fiscais FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Itens Nota Fiscal
CREATE TABLE public.itens_nota_fiscal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nota_fiscal_id uuid REFERENCES public.notas_fiscais(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  nome_produto text NOT NULL,
  quantidade numeric NOT NULL,
  valor_unitario numeric NOT NULL,
  valor_total numeric NOT NULL,
  estoque_id uuid REFERENCES public.estoque(id),
  status text NOT NULL DEFAULT 'confirmado',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.itens_nota_fiscal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own itens_nf" ON public.itens_nota_fiscal FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Receitas de Confeitaria
CREATE TABLE public.receitas_confeitaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  descricao text,
  rendimento numeric NOT NULL DEFAULT 1,
  unidade_rendimento text NOT NULL DEFAULT 'unidade',
  tempo_preparo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.receitas_confeitaria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own receitas" ON public.receitas_confeitaria FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Ingredientes da Receita
CREATE TABLE public.ingredientes_receita (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  receita_id uuid REFERENCES public.receitas_confeitaria(id) ON DELETE CASCADE NOT NULL,
  estoque_id uuid REFERENCES public.estoque(id) NOT NULL,
  quantidade numeric NOT NULL,
  unidade text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ingredientes_receita ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ingredientes" ON public.ingredientes_receita FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Produtos para Venda
CREATE TABLE public.produtos_venda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  receita_id uuid REFERENCES public.receitas_confeitaria(id),
  preco_venda numeric NOT NULL DEFAULT 0,
  margem_lucro numeric NOT NULL DEFAULT 0,
  custo_total numeric NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.produtos_venda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own produtos" ON public.produtos_venda FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Financeiro Confeitaria
CREATE TABLE public.financeiro_confeitaria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL,
  categoria text NOT NULL,
  descricao text NOT NULL,
  valor numeric NOT NULL,
  data date NOT NULL DEFAULT CURRENT_DATE,
  nota_fiscal_id uuid REFERENCES public.notas_fiscais(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.financeiro_confeitaria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own financeiro" ON public.financeiro_confeitaria FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add foreign key for nota_fiscal_id in movimentacao_estoque
ALTER TABLE public.movimentacao_estoque ADD CONSTRAINT movimentacao_nota_fk FOREIGN KEY (nota_fiscal_id) REFERENCES public.notas_fiscais(id);

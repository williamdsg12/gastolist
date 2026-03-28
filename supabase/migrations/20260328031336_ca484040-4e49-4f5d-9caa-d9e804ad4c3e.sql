
-- Drop existing restrictive policies on confeitaria tables and replace with shared access

-- fornecedores
DROP POLICY IF EXISTS "Users manage own fornecedores" ON public.fornecedores;
CREATE POLICY "Authenticated users can read fornecedores" ON public.fornecedores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert fornecedores" ON public.fornecedores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update fornecedores" ON public.fornecedores FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete fornecedores" ON public.fornecedores FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- estoque
DROP POLICY IF EXISTS "Users manage own estoque" ON public.estoque;
CREATE POLICY "Authenticated users can read estoque" ON public.estoque FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert estoque" ON public.estoque FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update estoque" ON public.estoque FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete estoque" ON public.estoque FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- movimentacao_estoque
DROP POLICY IF EXISTS "Users manage own movimentacao" ON public.movimentacao_estoque;
CREATE POLICY "Authenticated users can read movimentacao" ON public.movimentacao_estoque FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert movimentacao" ON public.movimentacao_estoque FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete movimentacao" ON public.movimentacao_estoque FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notas_fiscais
DROP POLICY IF EXISTS "Users manage own notas" ON public.notas_fiscais;
CREATE POLICY "Authenticated users can read notas" ON public.notas_fiscais FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert notas" ON public.notas_fiscais FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update notas" ON public.notas_fiscais FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete notas" ON public.notas_fiscais FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- itens_nota_fiscal
DROP POLICY IF EXISTS "Users manage own itens_nf" ON public.itens_nota_fiscal;
CREATE POLICY "Authenticated users can read itens_nf" ON public.itens_nota_fiscal FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert itens_nf" ON public.itens_nota_fiscal FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete itens_nf" ON public.itens_nota_fiscal FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- receitas_confeitaria
DROP POLICY IF EXISTS "Users manage own receitas" ON public.receitas_confeitaria;
CREATE POLICY "Authenticated users can read receitas" ON public.receitas_confeitaria FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert receitas" ON public.receitas_confeitaria FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update receitas" ON public.receitas_confeitaria FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete receitas" ON public.receitas_confeitaria FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ingredientes_receita
DROP POLICY IF EXISTS "Users manage own ingredientes" ON public.ingredientes_receita;
CREATE POLICY "Authenticated users can read ingredientes" ON public.ingredientes_receita FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert ingredientes" ON public.ingredientes_receita FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete ingredientes" ON public.ingredientes_receita FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- produtos_venda
DROP POLICY IF EXISTS "Users manage own produtos" ON public.produtos_venda;
CREATE POLICY "Authenticated users can read produtos" ON public.produtos_venda FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert produtos" ON public.produtos_venda FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update produtos" ON public.produtos_venda FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete produtos" ON public.produtos_venda FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- financeiro_confeitaria
DROP POLICY IF EXISTS "Users manage own financeiro" ON public.financeiro_confeitaria;
CREATE POLICY "Authenticated users can read financeiro" ON public.financeiro_confeitaria FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert financeiro" ON public.financeiro_confeitaria FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can update financeiro" ON public.financeiro_confeitaria FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete financeiro" ON public.financeiro_confeitaria FOR DELETE TO authenticated USING (auth.uid() = user_id);

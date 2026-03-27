import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

export interface EstoqueItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  custo_medio: number;
  estoque_minimo: number;
  categoria: string;
  updated_at: string;
}

export interface MovimentacaoEstoque {
  id: string;
  estoque_id: string;
  tipo: string;
  quantidade: number;
  custo_unitario: number;
  fornecedor_id?: string;
  nota_fiscal_id?: string;
  observacao?: string;
  data: string;
}

export interface NotaFiscal {
  id: string;
  fornecedor_id?: string;
  numero?: string;
  cnpj_emitente?: string;
  nome_emitente?: string;
  data_emissao?: string;
  valor_total: number;
  status: string;
  imagem_url?: string;
  created_at: string;
}

export interface ItemNotaFiscal {
  id: string;
  nota_fiscal_id: string;
  nome_produto: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  estoque_id?: string;
  status: string;
}

export interface ReceitaConfeitaria {
  id: string;
  nome: string;
  descricao?: string;
  rendimento: number;
  unidade_rendimento: string;
  tempo_preparo?: string;
}

export interface IngredienteReceita {
  id: string;
  receita_id: string;
  estoque_id: string;
  quantidade: number;
  unidade: string;
}

export interface ProdutoVenda {
  id: string;
  nome: string;
  receita_id?: string;
  preco_venda: number;
  margem_lucro: number;
  custo_total: number;
  ativo: boolean;
}

export interface FinanceiroConfeitaria {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  nota_fiscal_id?: string;
  created_at: string;
}

export function useConfeitariaData() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([]);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [itensNota, setItensNota] = useState<ItemNotaFiscal[]>([]);
  const [receitas, setReceitas] = useState<ReceitaConfeitaria[]>([]);
  const [ingredientes, setIngredientes] = useState<IngredienteReceita[]>([]);
  const [produtos, setProdutos] = useState<ProdutoVenda[]>([]);
  const [financeiro, setFinanceiro] = useState<FinanceiroConfeitaria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    getUser();
  }, []);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [forn, est, mov, nf, inNf, rec, ing, prod, fin] = await Promise.all([
        supabase.from('fornecedores').select('*').eq('user_id', userId).order('nome'),
        supabase.from('estoque').select('*').eq('user_id', userId).order('nome'),
        supabase.from('movimentacao_estoque').select('*').eq('user_id', userId).order('data', { ascending: false }),
        supabase.from('notas_fiscais').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('itens_nota_fiscal').select('*').eq('user_id', userId),
        supabase.from('receitas_confeitaria').select('*').eq('user_id', userId).order('nome'),
        supabase.from('ingredientes_receita').select('*').eq('user_id', userId),
        supabase.from('produtos_venda').select('*').eq('user_id', userId).order('nome'),
        supabase.from('financeiro_confeitaria').select('*').eq('user_id', userId).order('data', { ascending: false }),
      ]);

      if (forn.data) setFornecedores(forn.data as any);
      if (est.data) setEstoque(est.data as any);
      if (mov.data) setMovimentacoes(mov.data as any);
      if (nf.data) setNotasFiscais(nf.data as any);
      if (inNf.data) setItensNota(inNf.data as any);
      if (rec.data) setReceitas(rec.data as any);
      if (ing.data) setIngredientes(ing.data as any);
      if (prod.data) setProdutos(prod.data as any);
      if (fin.data) setFinanceiro(fin.data as any);
    } catch (error) {
      console.error('Error fetching confeitaria data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // CRUD helpers
  const addFornecedor = async (data: Omit<Fornecedor, 'id'>) => {
    if (!userId) return;
    const { error } = await supabase.from('fornecedores').insert({ ...data, user_id: userId } as any);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
    toast({ title: 'Fornecedor adicionado!' });
  };

  const updateFornecedor = async (id: string, data: Partial<Fornecedor>) => {
    const { error } = await supabase.from('fornecedores').update(data as any).eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const deleteFornecedor = async (id: string) => {
    const { error } = await supabase.from('fornecedores').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const addEstoqueItem = async (data: Omit<EstoqueItem, 'id' | 'updated_at'>) => {
    if (!userId) return;
    const { error } = await supabase.from('estoque').insert({ ...data, user_id: userId } as any);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
    toast({ title: 'Item adicionado ao estoque!' });
  };

  const updateEstoqueItem = async (id: string, data: Partial<EstoqueItem>) => {
    const { error } = await supabase.from('estoque').update({ ...data, updated_at: new Date().toISOString() } as any).eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const deleteEstoqueItem = async (id: string) => {
    const { error } = await supabase.from('estoque').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const addMovimentacao = async (data: Omit<MovimentacaoEstoque, 'id'>) => {
    if (!userId) return;
    const { error } = await supabase.from('movimentacao_estoque').insert({ ...data, user_id: userId } as any);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    
    // Update stock quantity and average cost
    const item = estoque.find(e => e.id === data.estoque_id);
    if (item) {
      let newQty = item.quantidade;
      let newCost = item.custo_medio;
      if (data.tipo === 'entrada') {
        const totalOld = item.quantidade * item.custo_medio;
        const totalNew = data.quantidade * (data.custo_unitario || 0);
        newQty = item.quantidade + data.quantidade;
        newCost = newQty > 0 ? (totalOld + totalNew) / newQty : 0;
      } else {
        newQty = Math.max(0, item.quantidade - data.quantidade);
      }
      await supabase.from('estoque').update({ quantidade: newQty, custo_medio: newCost, updated_at: new Date().toISOString() } as any).eq('id', data.estoque_id);
    }
    fetchAll();
  };

  const addNotaFiscal = async (data: Omit<NotaFiscal, 'id' | 'created_at'>) => {
    if (!userId) return null;
    const { data: result, error } = await supabase.from('notas_fiscais').insert({ ...data, user_id: userId } as any).select().single();
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return null; }
    fetchAll();
    return result;
  };

  const addItemNotaFiscal = async (data: Omit<ItemNotaFiscal, 'id'>) => {
    if (!userId) return;
    const { error } = await supabase.from('itens_nota_fiscal').insert({ ...data, user_id: userId } as any);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const addReceita = async (data: Omit<ReceitaConfeitaria, 'id'>) => {
    if (!userId) return null;
    const { data: result, error } = await supabase.from('receitas_confeitaria').insert({ ...data, user_id: userId } as any).select().single();
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return null; }
    fetchAll();
    toast({ title: 'Receita criada!' });
    return result;
  };

  const updateReceita = async (id: string, data: Partial<ReceitaConfeitaria>) => {
    const { error } = await supabase.from('receitas_confeitaria').update(data as any).eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const deleteReceita = async (id: string) => {
    const { error } = await supabase.from('receitas_confeitaria').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const addIngrediente = async (data: Omit<IngredienteReceita, 'id'>) => {
    if (!userId) return;
    const { error } = await supabase.from('ingredientes_receita').insert({ ...data, user_id: userId } as any);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const deleteIngrediente = async (id: string) => {
    const { error } = await supabase.from('ingredientes_receita').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const addProduto = async (data: Omit<ProdutoVenda, 'id'>) => {
    if (!userId) return;
    const { error } = await supabase.from('produtos_venda').insert({ ...data, user_id: userId } as any);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
    toast({ title: 'Produto adicionado!' });
  };

  const updateProduto = async (id: string, data: Partial<ProdutoVenda>) => {
    const { error } = await supabase.from('produtos_venda').update(data as any).eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const deleteProduto = async (id: string) => {
    const { error } = await supabase.from('produtos_venda').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  const addFinanceiro = async (data: Omit<FinanceiroConfeitaria, 'id' | 'created_at'>) => {
    if (!userId) return;
    const { error } = await supabase.from('financeiro_confeitaria').insert({ ...data, user_id: userId } as any);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
    toast({ title: 'Registro financeiro adicionado!' });
  };

  const deleteFinanceiro = async (id: string) => {
    const { error } = await supabase.from('financeiro_confeitaria').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    fetchAll();
  };

  // Computed
  const totalEntradas = financeiro.filter(f => f.tipo === 'entrada').reduce((s, f) => s + f.valor, 0);
  const totalSaidas = financeiro.filter(f => f.tipo === 'saida').reduce((s, f) => s + f.valor, 0);
  const lucroLiquido = totalEntradas - totalSaidas;
  const estoquesBaixos = estoque.filter(e => e.quantidade <= e.estoque_minimo);

  return {
    userId, loading, fornecedores, estoque, movimentacoes, notasFiscais, itensNota,
    receitas, ingredientes, produtos, financeiro, totalEntradas, totalSaidas, lucroLiquido, estoquesBaixos,
    addFornecedor, updateFornecedor, deleteFornecedor,
    addEstoqueItem, updateEstoqueItem, deleteEstoqueItem, addMovimentacao,
    addNotaFiscal, addItemNotaFiscal,
    addReceita, updateReceita, deleteReceita, addIngrediente, deleteIngrediente,
    addProduto, updateProduto, deleteProduto,
    addFinanceiro, deleteFinanceiro, fetchAll,
  };
}

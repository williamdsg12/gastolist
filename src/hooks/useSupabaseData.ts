import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import type { Entrada, Gasto, Conta, Meta, MESES } from '@/types/finance';

interface CategoriaPersonalizada {
  id: string;
  nome: string;
  tipo: 'entrada' | 'gasto';
  cor: string;
  icone?: string;
}

interface UseSupabaseDataReturn {
  user: User | null;
  isLoading: boolean;
  entradas: Entrada[];
  gastos: Gasto[];
  contas: Conta[];
  metas: Meta[];
  categoriasPersonalizadas: CategoriaPersonalizada[];
  addEntrada: (entrada: Omit<Entrada, 'id' | 'mes'>, mes: string) => Promise<void>;
  addGasto: (gasto: Omit<Gasto, 'id' | 'mes'>, mes: string) => Promise<void>;
  addConta: (conta: Omit<Conta, 'id' | 'mes'>, mes: string) => Promise<void>;
  addMeta: (meta: Omit<Meta, 'id' | 'mes'>, mes: string) => Promise<void>;
  addCategoriaPersonalizada: (cat: Omit<CategoriaPersonalizada, 'id'>) => Promise<void>;
  updateEntrada: (id: string, data: Partial<Entrada>) => Promise<void>;
  updateGasto: (id: string, data: Partial<Gasto>) => Promise<void>;
  updateConta: (id: string, data: Partial<Conta>) => Promise<void>;
  updateMeta: (id: string, data: Partial<Meta>) => Promise<void>;
  deleteEntrada: (id: string) => Promise<void>;
  deleteGasto: (id: string) => Promise<void>;
  deleteConta: (id: string) => Promise<void>;
  deleteMeta: (id: string) => Promise<void>;
  deleteCategoriaPersonalizada: (id: string) => Promise<void>;
  toggleContaPaga: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useSupabaseData(): UseSupabaseDataReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState<CategoriaPersonalizada[]>([]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setEntradas([]);
        setGastos([]);
        setContas([]);
        setMetas([]);
        setCategoriasPersonalizadas([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch all data when user changes
  const refreshData = useCallback(async () => {
    if (!user) return;
    
    try {
      const [entradasRes, gastosRes, contasRes, metasRes, categoriasRes] = await Promise.all([
        supabase.from('entradas').select('*').order('data', { ascending: false }),
        supabase.from('gastos').select('*').order('data', { ascending: false }),
        supabase.from('contas').select('*').order('vencimento', { ascending: true }),
        supabase.from('metas').select('*').order('created_at', { ascending: false }),
        supabase.from('categorias').select('*').order('nome', { ascending: true }),
      ]);

      if (entradasRes.data) {
        setEntradas(entradasRes.data.map(e => ({
          id: e.id,
          descricao: e.descricao,
          valor: Number(e.valor),
          categoria: e.categoria,
          responsavel: e.responsavel as 'William' | 'Andressa',
          data: e.data,
          mes: e.mes,
        })));
      }

      if (gastosRes.data) {
        setGastos(gastosRes.data.map(g => ({
          id: g.id,
          descricao: g.descricao,
          valor: Number(g.valor),
          categoria: g.categoria,
          responsavel: g.responsavel as 'William' | 'Andressa',
          data: g.data,
          mes: g.mes,
          pago: g.pago,
        })));
      }

      if (contasRes.data) {
        setContas(contasRes.data.map(c => ({
          id: c.id,
          conta: c.conta,
          valor: Number(c.valor),
          vencimento: c.vencimento,
          responsavel: c.responsavel as 'William' | 'Andressa',
          pago: c.pago,
          dataPagamento: c.data_pagamento || undefined,
          mes: c.mes,
        })));
      }

      if (metasRes.data) {
        setMetas(metasRes.data.map(m => ({
          id: m.id,
          nome: m.nome,
          valorMeta: Number(m.valor_meta),
          tipo: m.tipo as 'economia' | 'limite_gasto' | 'entrada',
          categoria: m.categoria || undefined,
          responsavel: m.responsavel as 'William' | 'Andressa' | 'Todos',
          mes: m.mes,
        })));
      }

      if (categoriasRes.data) {
        setCategoriasPersonalizadas(categoriasRes.data.map(c => ({
          id: c.id,
          nome: c.nome,
          tipo: c.tipo as 'entrada' | 'gasto',
          cor: c.cor || '#6b7280',
          icone: c.icone || undefined,
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // CRUD operations
  const addEntrada = async (entrada: Omit<Entrada, 'id' | 'mes'>, mes: string) => {
    if (!user) return;
    
    const { data, error } = await supabase.from('entradas').insert({
      descricao: entrada.descricao,
      valor: entrada.valor,
      categoria: entrada.categoria,
      responsavel: entrada.responsavel,
      data: entrada.data,
      mes,
      user_id: user.id,
    }).select().single();

    if (error) {
      toast.error('Erro ao adicionar entrada');
      throw error;
    }

    if (data) {
      setEntradas(prev => [{
        id: data.id,
        descricao: data.descricao,
        valor: Number(data.valor),
        categoria: data.categoria,
        responsavel: data.responsavel as 'William' | 'Andressa',
        data: data.data,
        mes: data.mes,
      }, ...prev]);
      toast.success('Entrada adicionada!');
    }
  };

  const addGasto = async (gasto: Omit<Gasto, 'id' | 'mes'>, mes: string) => {
    if (!user) return;
    
    const { data, error } = await supabase.from('gastos').insert({
      descricao: gasto.descricao,
      valor: gasto.valor,
      categoria: gasto.categoria,
      responsavel: gasto.responsavel,
      data: gasto.data,
      mes,
      pago: gasto.pago ?? true,
      user_id: user.id,
    }).select().single();

    if (error) {
      toast.error('Erro ao adicionar gasto');
      throw error;
    }

    if (data) {
      setGastos(prev => [{
        id: data.id,
        descricao: data.descricao,
        valor: Number(data.valor),
        categoria: data.categoria,
        responsavel: data.responsavel as 'William' | 'Andressa',
        data: data.data,
        mes: data.mes,
        pago: data.pago,
      }, ...prev]);
      toast.success('Gasto adicionado!');
    }
  };

  const addConta = async (conta: Omit<Conta, 'id' | 'mes'>, mes: string) => {
    if (!user) return;
    
    const { data, error } = await supabase.from('contas').insert({
      conta: conta.conta,
      valor: conta.valor,
      vencimento: conta.vencimento,
      responsavel: conta.responsavel,
      pago: conta.pago ?? false,
      data_pagamento: conta.dataPagamento || null,
      mes,
      user_id: user.id,
    }).select().single();

    if (error) {
      toast.error('Erro ao adicionar conta');
      throw error;
    }

    if (data) {
      setContas(prev => [...prev, {
        id: data.id,
        conta: data.conta,
        valor: Number(data.valor),
        vencimento: data.vencimento,
        responsavel: data.responsavel as 'William' | 'Andressa',
        pago: data.pago,
        dataPagamento: data.data_pagamento || undefined,
        mes: data.mes,
      }].sort((a, b) => a.vencimento.localeCompare(b.vencimento)));
      toast.success('Conta adicionada!');
    }
  };

  const addMeta = async (meta: Omit<Meta, 'id' | 'mes'>, mes: string) => {
    if (!user) return;
    
    const { data, error } = await supabase.from('metas').insert({
      nome: meta.nome,
      valor_meta: meta.valorMeta,
      tipo: meta.tipo,
      categoria: meta.categoria || null,
      responsavel: meta.responsavel,
      mes,
      user_id: user.id,
    }).select().single();

    if (error) {
      toast.error('Erro ao adicionar meta');
      throw error;
    }

    if (data) {
      setMetas(prev => [{
        id: data.id,
        nome: data.nome,
        valorMeta: Number(data.valor_meta),
        tipo: data.tipo as 'economia' | 'limite_gasto' | 'entrada',
        categoria: data.categoria || undefined,
        responsavel: data.responsavel as 'William' | 'Andressa' | 'Todos',
        mes: data.mes,
      }, ...prev]);
      toast.success('Meta adicionada!');
    }
  };

  const addCategoriaPersonalizada = async (cat: Omit<CategoriaPersonalizada, 'id'>) => {
    if (!user) return;
    
    const { data, error } = await supabase.from('categorias').insert({
      nome: cat.nome,
      tipo: cat.tipo,
      cor: cat.cor,
      icone: cat.icone || 'tag',
      user_id: user.id,
    }).select().single();

    if (error) {
      toast.error('Erro ao adicionar categoria');
      throw error;
    }

    if (data) {
      setCategoriasPersonalizadas(prev => [...prev, {
        id: data.id,
        nome: data.nome,
        tipo: data.tipo as 'entrada' | 'gasto',
        cor: data.cor || '#6b7280',
        icone: data.icone || undefined,
      }]);
      toast.success('Categoria adicionada!');
    }
  };

  const updateEntrada = async (id: string, data: Partial<Entrada>) => {
    const { error } = await supabase.from('entradas').update({
      descricao: data.descricao,
      valor: data.valor,
      categoria: data.categoria,
      responsavel: data.responsavel,
      data: data.data,
    }).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar entrada');
      throw error;
    }

    setEntradas(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const updateGasto = async (id: string, data: Partial<Gasto>) => {
    const { error } = await supabase.from('gastos').update({
      descricao: data.descricao,
      valor: data.valor,
      categoria: data.categoria,
      responsavel: data.responsavel,
      data: data.data,
      pago: data.pago,
    }).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar gasto');
      throw error;
    }

    setGastos(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };

  const updateConta = async (id: string, data: Partial<Conta>) => {
    const { error } = await supabase.from('contas').update({
      conta: data.conta,
      valor: data.valor,
      vencimento: data.vencimento,
      responsavel: data.responsavel,
      pago: data.pago,
      data_pagamento: data.dataPagamento || null,
    }).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar conta');
      throw error;
    }

    setContas(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const updateMeta = async (id: string, data: Partial<Meta>) => {
    const { error } = await supabase.from('metas').update({
      nome: data.nome,
      valor_meta: data.valorMeta,
      tipo: data.tipo,
      categoria: data.categoria || null,
      responsavel: data.responsavel,
    }).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar meta');
      throw error;
    }

    setMetas(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const deleteEntrada = async (id: string) => {
    const { error } = await supabase.from('entradas').delete().eq('id', id);
    
    if (error) {
      toast.error('Erro ao excluir entrada');
      throw error;
    }

    setEntradas(prev => prev.filter(e => e.id !== id));
    toast.success('Entrada excluída');
  };

  const deleteGasto = async (id: string) => {
    const { error } = await supabase.from('gastos').delete().eq('id', id);
    
    if (error) {
      toast.error('Erro ao excluir gasto');
      throw error;
    }

    setGastos(prev => prev.filter(g => g.id !== id));
    toast.success('Gasto excluído');
  };

  const deleteConta = async (id: string) => {
    const { error } = await supabase.from('contas').delete().eq('id', id);
    
    if (error) {
      toast.error('Erro ao excluir conta');
      throw error;
    }

    setContas(prev => prev.filter(c => c.id !== id));
    toast.success('Conta excluída');
  };

  const deleteMeta = async (id: string) => {
    const { error } = await supabase.from('metas').delete().eq('id', id);
    
    if (error) {
      toast.error('Erro ao excluir meta');
      throw error;
    }

    setMetas(prev => prev.filter(m => m.id !== id));
    toast.success('Meta excluída');
  };

  const deleteCategoriaPersonalizada = async (id: string) => {
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    
    if (error) {
      toast.error('Erro ao excluir categoria');
      throw error;
    }

    setCategoriasPersonalizadas(prev => prev.filter(c => c.id !== id));
    toast.success('Categoria excluída');
  };

  const toggleContaPaga = async (id: string) => {
    const conta = contas.find(c => c.id === id);
    if (!conta) return;

    const newPago = !conta.pago;
    const dataPagamento = newPago ? new Date().toISOString().split('T')[0] : null;

    const { error } = await supabase.from('contas').update({
      pago: newPago,
      data_pagamento: dataPagamento,
    }).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar conta');
      throw error;
    }

    setContas(prev => prev.map(c => 
      c.id === id ? { ...c, pago: newPago, dataPagamento: dataPagamento || undefined } : c
    ));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logout realizado');
  };

  return {
    user,
    isLoading,
    entradas,
    gastos,
    contas,
    metas,
    categoriasPersonalizadas,
    addEntrada,
    addGasto,
    addConta,
    addMeta,
    addCategoriaPersonalizada,
    updateEntrada,
    updateGasto,
    updateConta,
    updateMeta,
    deleteEntrada,
    deleteGasto,
    deleteConta,
    deleteMeta,
    deleteCategoriaPersonalizada,
    toggleContaPaga,
    refreshData,
    signOut,
  };
}

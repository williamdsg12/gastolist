import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import type { ItemCompra } from '@/types/shopping';

interface UseShoppingDataReturn {
  user: User | null;
  items: ItemCompra[];
  isLoading: boolean;
  addItem: (item: Omit<ItemCompra, 'id' | 'data'>) => Promise<void>;
  updateItem: (id: string, data: Partial<ItemCompra>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleComprado: (id: string) => Promise<void>;
  duplicateLastMonth: () => Promise<void>;
  clearComprados: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useShoppingData(): UseShoppingDataReturn {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setItems([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lista_compras')
        .select('*')
        .order('categoria', { ascending: true })
        .order('produto', { ascending: true });

      if (error) throw error;

      if (data) {
        setItems(data.map(item => ({
          id: item.id,
          produto: item.produto,
          quantidade: Number(item.quantidade),
          unidade: item.unidade || 'un',
          preco: Number(item.preco) || 0,
          categoria: item.categoria,
          comprado: item.comprado,
          loja: item.loja || undefined,
          observacao: item.observacao || undefined,
          foto_url: item.foto_url || undefined,
          data: item.data,
        })));
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      toast.error('Erro ao carregar lista de compras');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  const addItem = async (item: Omit<ItemCompra, 'id' | 'data'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('lista_compras').insert({
      produto: item.produto,
      quantidade: item.quantidade,
      unidade: item.unidade,
      preco: item.preco,
      categoria: item.categoria,
      comprado: item.comprado,
      loja: item.loja || null,
      observacao: item.observacao || null,
      foto_url: item.foto_url || null,
      user_id: user.id,
    }).select().single();

    if (error) {
      toast.error('Erro ao adicionar item');
      throw error;
    }

    if (data) {
      setItems(prev => [...prev, {
        id: data.id,
        produto: data.produto,
        quantidade: Number(data.quantidade),
        unidade: data.unidade || 'un',
        preco: Number(data.preco) || 0,
        categoria: data.categoria,
        comprado: data.comprado,
        loja: data.loja || undefined,
        observacao: data.observacao || undefined,
        foto_url: data.foto_url || undefined,
        data: data.data,
      }].sort((a, b) => a.categoria.localeCompare(b.categoria)));
      toast.success('Item adicionado!');
    }
  };

  const updateItem = async (id: string, data: Partial<ItemCompra>) => {
    const { error } = await supabase.from('lista_compras').update({
      produto: data.produto,
      quantidade: data.quantidade,
      unidade: data.unidade,
      preco: data.preco,
      categoria: data.categoria,
      comprado: data.comprado,
      loja: data.loja || null,
      observacao: data.observacao || null,
      foto_url: data.foto_url || null,
    }).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar item');
      throw error;
    }

    setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('lista_compras').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao excluir item');
      throw error;
    }

    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item excluído');
  };

  const toggleComprado = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const { error } = await supabase.from('lista_compras').update({
      comprado: !item.comprado,
    }).eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar item');
      throw error;
    }

    setItems(prev => prev.map(i => i.id === id ? { ...i, comprado: !i.comprado } : i));
  };

  const duplicateLastMonth = async () => {
    if (!user) return;

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0].substring(0, 7);

    const { data: lastMonthItems, error: fetchError } = await supabase
      .from('lista_compras')
      .select('*')
      .gte('data', `${lastMonthStr}-01`)
      .lt('data', new Date().toISOString().split('T')[0].substring(0, 7) + '-01');

    if (fetchError) {
      toast.error('Erro ao buscar itens do mês anterior');
      return;
    }

    if (!lastMonthItems || lastMonthItems.length === 0) {
      toast.info('Nenhum item encontrado no mês anterior');
      return;
    }

    const newItems = lastMonthItems.map(item => ({
      produto: item.produto,
      quantidade: item.quantidade,
      unidade: item.unidade,
      preco: item.preco,
      categoria: item.categoria,
      comprado: false,
      loja: item.loja,
      observacao: item.observacao,
      foto_url: item.foto_url,
      user_id: user.id,
    }));

    const { error: insertError } = await supabase.from('lista_compras').insert(newItems);

    if (insertError) {
      toast.error('Erro ao duplicar itens');
      return;
    }

    await refreshData();
    toast.success(`${newItems.length} itens duplicados!`);
  };

  const clearComprados = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('lista_compras')
      .delete()
      .eq('comprado', true);

    if (error) {
      toast.error('Erro ao limpar itens');
      return;
    }

    setItems(prev => prev.filter(item => !item.comprado));
    toast.success('Itens comprados removidos');
  };

  return {
    user,
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    toggleComprado,
    duplicateLastMonth,
    clearComprados,
    refreshData,
  };
}

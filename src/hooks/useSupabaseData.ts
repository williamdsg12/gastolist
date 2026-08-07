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
    const getStoredUser = (): User | null => {
      const stored = localStorage.getItem('gastolist_custom_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
      return null;
    };

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(getStoredUser());
      }
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(getStoredUser());
      }
    });

    initAuth();

    const handleLocalUserChange = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(getStoredUser());
        }
      });
    };

    window.addEventListener('gastolist_user_changed', handleLocalUserChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('gastolist_user_changed', handleLocalUserChange);
    };
  }, []);

  // Helpers for local storage
  const getLocalData = <T>(key: string, defaultValue: T[]): T[] => {
    try {
      const item = localStorage.getItem(`gastolist_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const saveLocalData = <T>(key: string, data: T[]) => {
    try {
      localStorage.setItem(`gastolist_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  // Fetch all data when user changes
  const refreshData = useCallback(async () => {
    if (!user) return;

    const isLocal = user.id.startsWith('local-');

    if (isLocal) {
      setEntradas(getLocalData('entradas', []));
      setGastos(getLocalData('gastos', []));
      setContas(getLocalData('contas', []));
      setMetas(getLocalData('metas', []));
      setCategoriasPersonalizadas(getLocalData('categorias', []));
      return;
    }
    
    try {
      const [entradasRes, gastosRes, contasRes, metasRes, categoriasRes] = await Promise.all([
        supabase.from('entradas').select('*').order('data', { ascending: false }),
        supabase.from('gastos').select('*').order('data', { ascending: false }),
        supabase.from('contas').select('*').order('vencimento', { ascending: true }),
        supabase.from('metas').select('*').order('created_at', { ascending: false }),
        supabase.from('categorias').select('*').order('nome', { ascending: true }),
      ]);

      if (entradasRes.error || gastosRes.error || contasRes.error || metasRes.error || categoriasRes.error) {
        // Fallback to local storage if supabase tables have issues
        setEntradas(getLocalData('entradas', []));
        setGastos(getLocalData('gastos', []));
        setContas(getLocalData('contas', []));
        setMetas(getLocalData('metas', []));
        setCategoriasPersonalizadas(getLocalData('categorias', []));
        return;
      }

      if (entradasRes.data) {
        const mapped = entradasRes.data.map(e => ({
          id: e.id,
          descricao: e.descricao,
          valor: Number(e.valor),
          categoria: e.categoria,
          responsavel: e.responsavel as 'William' | 'Andressa',
          data: e.data,
          mes: e.mes,
        }));
        setEntradas(mapped);
        saveLocalData('entradas', mapped);
      }

      if (gastosRes.data) {
        const mapped = gastosRes.data.map(g => ({
          id: g.id,
          descricao: g.descricao,
          valor: Number(g.valor),
          categoria: g.categoria,
          responsavel: g.responsavel as 'William' | 'Andressa',
          data: g.data,
          mes: g.mes,
          pago: g.pago,
        }));
        setGastos(mapped);
        saveLocalData('gastos', mapped);
      }

      if (contasRes.data) {
        const mapped = contasRes.data.map(c => ({
          id: c.id,
          conta: c.conta,
          valor: Number(c.valor),
          vencimento: c.vencimento,
          responsavel: c.responsavel as 'William' | 'Andressa',
          pago: c.pago,
          dataPagamento: c.data_pagamento || undefined,
          mes: c.mes,
        }));
        setContas(mapped);
        saveLocalData('contas', mapped);
      }

      if (metasRes.data) {
        const mapped = metasRes.data.map(m => ({
          id: m.id,
          nome: m.nome,
          valorMeta: Number(m.valor_meta),
          tipo: m.tipo as 'economia' | 'limite_gasto' | 'entrada',
          categoria: m.categoria || undefined,
          responsavel: m.responsavel as 'William' | 'Andressa' | 'Todos',
          mes: m.mes,
        }));
        setMetas(mapped);
        saveLocalData('metas', mapped);
      }

      if (categoriasRes.data) {
        const mapped = categoriasRes.data.map(c => ({
          id: c.id,
          nome: c.nome,
          tipo: c.tipo as 'entrada' | 'gasto',
          cor: c.cor || '#6b7280',
          icone: c.icone || undefined,
        }));
        setCategoriasPersonalizadas(mapped);
        saveLocalData('categorias', mapped);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setEntradas(getLocalData('entradas', []));
      setGastos(getLocalData('gastos', []));
      setContas(getLocalData('contas', []));
      setMetas(getLocalData('metas', []));
      setCategoriasPersonalizadas(getLocalData('categorias', []));
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
    
    const isLocal = user.id.startsWith('local-');
    if (isLocal) {
      const newItem: Entrada = {
        ...entrada,
        id: crypto.randomUUID(),
        mes,
      };
      setEntradas(prev => {
        const updated = [newItem, ...prev];
        saveLocalData('entradas', updated);
        return updated;
      });
      toast.success('Entrada adicionada!');
      return;
    }

    try {
      const { data, error } = await supabase.from('entradas').insert({
        descricao: entrada.descricao,
        valor: entrada.valor,
        categoria: entrada.categoria,
        responsavel: entrada.responsavel,
        data: entrada.data,
        mes,
        user_id: user.id,
      }).select().single();

      if (error) throw error;

      if (data) {
        setEntradas(prev => {
          const updated = [{
            id: data.id,
            descricao: data.descricao,
            valor: Number(data.valor),
            categoria: data.categoria,
            responsavel: data.responsavel as 'William' | 'Andressa',
            data: data.data,
            mes: data.mes,
          }, ...prev];
          saveLocalData('entradas', updated);
          return updated;
        });
        toast.success('Entrada adicionada!');
      }
    } catch (error) {
      console.warn('Supabase insert failed, using local storage fallback', error);
      const newItem: Entrada = {
        ...entrada,
        id: crypto.randomUUID(),
        mes,
      };
      setEntradas(prev => {
        const updated = [newItem, ...prev];
        saveLocalData('entradas', updated);
        return updated;
      });
      toast.success('Entrada adicionada (local)!');
    }
  };

  const addGasto = async (gasto: Omit<Gasto, 'id' | 'mes'>, mes: string) => {
    if (!user) return;

    const isLocal = user.id.startsWith('local-');
    if (isLocal) {
      const newItem: Gasto = {
        ...gasto,
        id: crypto.randomUUID(),
        mes,
        pago: gasto.pago ?? true,
      };
      setGastos(prev => {
        const updated = [newItem, ...prev];
        saveLocalData('gastos', updated);
        return updated;
      });
      toast.success('Gasto adicionado!');
      return;
    }

    try {
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

      if (error) throw error;

      if (data) {
        setGastos(prev => {
          const updated = [{
            id: data.id,
            descricao: data.descricao,
            valor: Number(data.valor),
            categoria: data.categoria,
            responsavel: data.responsavel as 'William' | 'Andressa',
            data: data.data,
            mes: data.mes,
            pago: data.pago,
          }, ...prev];
          saveLocalData('gastos', updated);
          return updated;
        });
        toast.success('Gasto adicionado!');
      }
    } catch (error) {
      console.warn('Supabase insert failed, using local storage fallback', error);
      const newItem: Gasto = {
        ...gasto,
        id: crypto.randomUUID(),
        mes,
        pago: gasto.pago ?? true,
      };
      setGastos(prev => {
        const updated = [newItem, ...prev];
        saveLocalData('gastos', updated);
        return updated;
      });
      toast.success('Gasto adicionado (local)!');
    }
  };

  const addConta = async (conta: Omit<Conta, 'id' | 'mes'>, mes: string) => {
    if (!user) return;

    const isLocal = user.id.startsWith('local-');
    if (isLocal) {
      const newItem: Conta = {
        ...conta,
        id: crypto.randomUUID(),
        mes,
        pago: conta.pago ?? false,
      };
      setContas(prev => {
        const updated = [...prev, newItem].sort((a, b) => a.vencimento.localeCompare(b.vencimento));
        saveLocalData('contas', updated);
        return updated;
      });
      toast.success('Conta adicionada!');
      return;
    }

    try {
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

      if (error) throw error;

      if (data) {
        setContas(prev => {
          const updated = [...prev, {
            id: data.id,
            conta: data.conta,
            valor: Number(data.valor),
            vencimento: data.vencimento,
            responsavel: data.responsavel as 'William' | 'Andressa',
            pago: data.pago,
            dataPagamento: data.data_pagamento || undefined,
            mes: data.mes,
          }].sort((a, b) => a.vencimento.localeCompare(b.vencimento));
          saveLocalData('contas', updated);
          return updated;
        });
        toast.success('Conta adicionada!');
      }
    } catch (error) {
      const newItem: Conta = {
        ...conta,
        id: crypto.randomUUID(),
        mes,
        pago: conta.pago ?? false,
      };
      setContas(prev => {
        const updated = [...prev, newItem].sort((a, b) => a.vencimento.localeCompare(b.vencimento));
        saveLocalData('contas', updated);
        return updated;
      });
      toast.success('Conta adicionada (local)!');
    }
  };

  const addMeta = async (meta: Omit<Meta, 'id' | 'mes'>, mes: string) => {
    if (!user) return;

    const isLocal = user.id.startsWith('local-');
    if (isLocal) {
      const newItem: Meta = {
        ...meta,
        id: crypto.randomUUID(),
        mes,
      };
      setMetas(prev => {
        const updated = [newItem, ...prev];
        saveLocalData('metas', updated);
        return updated;
      });
      toast.success('Meta adicionada!');
      return;
    }

    try {
      const { data, error } = await supabase.from('metas').insert({
        nome: meta.nome,
        valor_meta: meta.valorMeta,
        tipo: meta.tipo,
        categoria: meta.categoria || null,
        responsavel: meta.responsavel,
        mes,
        user_id: user.id,
      }).select().single();

      if (error) throw error;

      if (data) {
        setMetas(prev => {
          const updated = [{
            id: data.id,
            nome: data.nome,
            valorMeta: Number(data.valor_meta),
            tipo: data.tipo as 'economia' | 'limite_gasto' | 'entrada',
            categoria: data.categoria || undefined,
            responsavel: data.responsavel as 'William' | 'Andressa' | 'Todos',
            mes: data.mes,
          }, ...prev];
          saveLocalData('metas', updated);
          return updated;
        });
        toast.success('Meta adicionada!');
      }
    } catch (error) {
      const newItem: Meta = {
        ...meta,
        id: crypto.randomUUID(),
        mes,
      };
      setMetas(prev => {
        const updated = [newItem, ...prev];
        saveLocalData('metas', updated);
        return updated;
      });
      toast.success('Meta adicionada (local)!');
    }
  };

  const addCategoriaPersonalizada = async (cat: Omit<CategoriaPersonalizada, 'id'>) => {
    if (!user) return;

    const isLocal = user.id.startsWith('local-');
    if (isLocal) {
      const newItem: CategoriaPersonalizada = {
        ...cat,
        id: crypto.randomUUID(),
      };
      setCategoriasPersonalizadas(prev => {
        const updated = [...prev, newItem];
        saveLocalData('categorias', updated);
        return updated;
      });
      toast.success('Categoria adicionada!');
      return;
    }

    try {
      const { data, error } = await supabase.from('categorias').insert({
        nome: cat.nome,
        tipo: cat.tipo,
        cor: cat.cor,
        icone: cat.icone || 'tag',
        user_id: user.id,
      }).select().single();

      if (error) throw error;

      if (data) {
        setCategoriasPersonalizadas(prev => {
          const updated = [...prev, {
            id: data.id,
            nome: data.nome,
            tipo: data.tipo as 'entrada' | 'gasto',
            cor: data.cor || '#6b7280',
            icone: data.icone || undefined,
          }];
          saveLocalData('categorias', updated);
          return updated;
        });
        toast.success('Categoria adicionada!');
      }
    } catch (error) {
      const newItem: CategoriaPersonalizada = {
        ...cat,
        id: crypto.randomUUID(),
      };
      setCategoriasPersonalizadas(prev => {
        const updated = [...prev, newItem];
        saveLocalData('categorias', updated);
        return updated;
      });
      toast.success('Categoria adicionada (local)!');
    }
  };

  const updateEntrada = async (id: string, data: Partial<Entrada>) => {
    if (!user?.id.startsWith('local-')) {
      await supabase.from('entradas').update({
        descricao: data.descricao,
        valor: data.valor,
        categoria: data.categoria,
        responsavel: data.responsavel,
        data: data.data,
      }).eq('id', id);
    }

    setEntradas(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...data } : e);
      saveLocalData('entradas', updated);
      return updated;
    });
  };

  const updateGasto = async (id: string, data: Partial<Gasto>) => {
    if (!user?.id.startsWith('local-')) {
      await supabase.from('gastos').update({
        descricao: data.descricao,
        valor: data.valor,
        categoria: data.categoria,
        responsavel: data.responsavel,
        data: data.data,
        pago: data.pago,
      }).eq('id', id);
    }

    setGastos(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, ...data } : g);
      saveLocalData('gastos', updated);
      return updated;
    });
  };

  const updateConta = async (id: string, data: Partial<Conta>) => {
    if (!user?.id.startsWith('local-')) {
      await supabase.from('contas').update({
        conta: data.conta,
        valor: data.valor,
        vencimento: data.vencimento,
        responsavel: data.responsavel,
        pago: data.pago,
        data_pagamento: data.dataPagamento || null,
      }).eq('id', id);
    }

    setContas(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...data } : c);
      saveLocalData('contas', updated);
      return updated;
    });
  };

  const updateMeta = async (id: string, data: Partial<Meta>) => {
    if (!user?.id.startsWith('local-')) {
      await supabase.from('metas').update({
        nome: data.nome,
        valor_meta: data.valorMeta,
        tipo: data.tipo,
        categoria: data.categoria || null,
        responsavel: data.responsavel,
      }).eq('id', id);
    }

    setMetas(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...data } : m);
      saveLocalData('metas', updated);
      return updated;
    });
  };

  const deleteEntrada = async (id: string) => {
    if (!user?.id.startsWith('local-')) {
      await supabase.from('entradas').delete().eq('id', id);
    }
    
    setEntradas(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveLocalData('entradas', updated);
      return updated;
    });
    toast.success('Entrada excluída');
  };

  const deleteGasto = async (id: string) => {
    if (!user?.id.startsWith('local-')) {
      await supabase.from('gastos').delete().eq('id', id);
    }

    setGastos(prev => {
      const updated = prev.filter(g => g.id !== id);
      saveLocalData('gastos', updated);
      return updated;
    });
    toast.success('Gasto excluído');
  };

  const deleteConta = async (id: string) => {
    if (!user?.id.startsWith('local-')) {
      await supabase.from('contas').delete().eq('id', id);
    }

    setContas(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveLocalData('contas', updated);
      return updated;
    });
    toast.success('Conta excluída');
  };

  const deleteMeta = async (id: string) => {
    if (!user?.id.startsWith('local-')) {
      await supabase.from('metas').delete().eq('id', id);
    }

    setMetas(prev => {
      const updated = prev.filter(m => m.id !== id);
      saveLocalData('metas', updated);
      return updated;
    });
    toast.success('Meta excluída');
  };

  const deleteCategoriaPersonalizada = async (id: string) => {
    if (!user?.id.startsWith('local-')) {
      await supabase.from('categorias').delete().eq('id', id);
    }

    setCategoriasPersonalizadas(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveLocalData('categorias', updated);
      return updated;
    });
    toast.success('Categoria excluída');
  };

  const toggleContaPaga = async (id: string) => {
    const conta = contas.find(c => c.id === id);
    if (!conta) return;

    const newPago = !conta.pago;
    const dataPagamento = newPago ? new Date().toISOString().split('T')[0] : null;

    if (!user?.id.startsWith('local-')) {
      await supabase.from('contas').update({
        pago: newPago,
        data_pagamento: dataPagamento,
      }).eq('id', id);
    }

    setContas(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, pago: newPago, dataPagamento: dataPagamento || undefined } : c
      );
      saveLocalData('contas', updated);
      return updated;
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('gastolist_custom_user');
    window.dispatchEvent(new Event('gastolist_user_changed'));
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

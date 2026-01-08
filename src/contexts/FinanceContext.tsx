import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Entrada, Gasto, Conta, Meta, ResumoMensal, ResumoPessoa, Responsavel, MESES, CATEGORIAS_ENTRADA, CATEGORIAS_GASTO } from '@/types/finance';
import { User } from '@supabase/supabase-js';

interface CategoriaPersonalizada {
  id: string;
  nome: string;
  tipo: 'entrada' | 'gasto';
  cor: string;
}

interface FinanceContextType {
  user: User | null;
  isLoading: boolean;
  entradas: Entrada[];
  gastos: Gasto[];
  contas: Conta[];
  metas: Meta[];
  categoriasPersonalizadas: CategoriaPersonalizada[];
  mesSelecionado: string;
  anoSelecionado: number;
  responsavelFiltro: Responsavel;
  setMesSelecionado: (mes: string) => void;
  setAnoSelecionado: (ano: number) => void;
  setResponsavelFiltro: (responsavel: Responsavel) => void;
  addEntrada: (entrada: Omit<Entrada, 'id' | 'mes'>) => void;
  addGasto: (gasto: Omit<Gasto, 'id' | 'mes'>) => void;
  addConta: (conta: Omit<Conta, 'id' | 'mes'>) => void;
  addMeta: (meta: Omit<Meta, 'id' | 'mes'>) => void;
  addCategoriaPersonalizada: (cat: Omit<CategoriaPersonalizada, 'id'>) => void;
  updateEntrada: (id: string, entrada: Partial<Entrada>) => void;
  updateGasto: (id: string, gasto: Partial<Gasto>) => void;
  updateConta: (id: string, conta: Partial<Conta>) => void;
  updateMeta: (id: string, meta: Partial<Meta>) => void;
  deleteEntrada: (id: string) => void;
  deleteGasto: (id: string) => void;
  deleteConta: (id: string) => void;
  deleteMeta: (id: string) => void;
  deleteCategoriaPersonalizada: (id: string) => void;
  toggleContaPaga: (id: string) => void;
  getResumoMensal: () => ResumoMensal;
  getResumoPessoa: (pessoa: 'William' | 'Andressa') => ResumoPessoa;
  getEntradasFiltradas: () => Entrada[];
  getGastosFiltrados: () => Gasto[];
  getContasFiltradas: () => Conta[];
  getMetasFiltradas: () => Meta[];
  getProgressoMeta: (meta: Meta) => { atual: number; percentual: number };
  getCategoriasEntrada: () => string[];
  getCategoriasGasto: () => string[];
  signOut: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const getCurrentMonth = () => MESES[new Date().getMonth()];
const getCurrentYear = () => new Date().getFullYear();

export function FinanceProvider({ children }: { children: ReactNode }) {
  const supabaseData = useSupabaseData();
  
  const [mesSelecionado, setMesSelecionado] = useState(getCurrentMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(getCurrentYear());
  const [responsavelFiltro, setResponsavelFiltro] = useState<Responsavel>('Todos');

  const getMesAnoKey = () => `${mesSelecionado}-${anoSelecionado}`;

  const getCategoriasEntrada = () => {
    const personalizadas = supabaseData.categoriasPersonalizadas
      .filter(c => c.tipo === 'entrada')
      .map(c => c.nome);
    return [...CATEGORIAS_ENTRADA, ...personalizadas];
  };

  const getCategoriasGasto = () => {
    const personalizadas = supabaseData.categoriasPersonalizadas
      .filter(c => c.tipo === 'gasto')
      .map(c => c.nome);
    return [...CATEGORIAS_GASTO, ...personalizadas];
  };

  const addEntrada = (entrada: Omit<Entrada, 'id' | 'mes'>) => {
    supabaseData.addEntrada(entrada, getMesAnoKey());
  };

  const addGasto = (gasto: Omit<Gasto, 'id' | 'mes'>) => {
    supabaseData.addGasto(gasto, getMesAnoKey());
  };

  const addConta = (conta: Omit<Conta, 'id' | 'mes'>) => {
    supabaseData.addConta(conta, getMesAnoKey());
  };

  const addMeta = (meta: Omit<Meta, 'id' | 'mes'>) => {
    supabaseData.addMeta(meta, getMesAnoKey());
  };

  const addCategoriaPersonalizada = (cat: Omit<CategoriaPersonalizada, 'id'>) => {
    supabaseData.addCategoriaPersonalizada(cat);
  };

  const getEntradasFiltradas = () => {
    return supabaseData.entradas.filter(e => {
      const matchMes = e.mes === getMesAnoKey();
      const matchResponsavel = responsavelFiltro === 'Todos' || e.responsavel === responsavelFiltro;
      return matchMes && matchResponsavel;
    });
  };

  const getGastosFiltrados = () => {
    return supabaseData.gastos.filter(g => {
      const matchMes = g.mes === getMesAnoKey();
      const matchResponsavel = responsavelFiltro === 'Todos' || g.responsavel === responsavelFiltro;
      return matchMes && matchResponsavel;
    });
  };

  const getContasFiltradas = () => {
    return supabaseData.contas.filter(c => {
      const matchMes = c.mes === getMesAnoKey();
      const matchResponsavel = responsavelFiltro === 'Todos' || c.responsavel === responsavelFiltro;
      return matchMes && matchResponsavel;
    });
  };

  const getMetasFiltradas = () => {
    return supabaseData.metas.filter(m => {
      const matchMes = m.mes === getMesAnoKey();
      const matchResponsavel = responsavelFiltro === 'Todos' || m.responsavel === 'Todos' || m.responsavel === responsavelFiltro;
      return matchMes && matchResponsavel;
    });
  };

  const getProgressoMeta = (meta: Meta): { atual: number; percentual: number } => {
    const mesKey = meta.mes;
    
    if (meta.tipo === 'economia') {
      const entradasMes = supabaseData.entradas.filter(e => e.mes === mesKey && (meta.responsavel === 'Todos' || e.responsavel === meta.responsavel));
      const gastosMes = supabaseData.gastos.filter(g => g.mes === mesKey && (meta.responsavel === 'Todos' || g.responsavel === meta.responsavel));
      const totalEntradas = entradasMes.reduce((s, e) => s + e.valor, 0);
      const totalGastos = gastosMes.reduce((s, g) => s + g.valor, 0);
      const economia = totalEntradas - totalGastos;
      return {
        atual: economia,
        percentual: meta.valorMeta > 0 ? Math.min((economia / meta.valorMeta) * 100, 100) : 0
      };
    } else if (meta.tipo === 'limite_gasto') {
      const gastosMes = supabaseData.gastos.filter(g => {
        const matchMes = g.mes === mesKey;
        const matchResponsavel = meta.responsavel === 'Todos' || g.responsavel === meta.responsavel;
        const matchCategoria = !meta.categoria || g.categoria === meta.categoria;
        return matchMes && matchResponsavel && matchCategoria;
      });
      const totalGastos = gastosMes.reduce((s, g) => s + g.valor, 0);
      return {
        atual: totalGastos,
        percentual: meta.valorMeta > 0 ? Math.min((totalGastos / meta.valorMeta) * 100, 150) : 0
      };
    } else {
      const entradasMes = supabaseData.entradas.filter(e => {
        const matchMes = e.mes === mesKey;
        const matchResponsavel = meta.responsavel === 'Todos' || e.responsavel === meta.responsavel;
        const matchCategoria = !meta.categoria || e.categoria === meta.categoria;
        return matchMes && matchResponsavel && matchCategoria;
      });
      const totalEntradas = entradasMes.reduce((s, e) => s + e.valor, 0);
      return {
        atual: totalEntradas,
        percentual: meta.valorMeta > 0 ? Math.min((totalEntradas / meta.valorMeta) * 100, 100) : 0
      };
    }
  };

  const getResumoMensal = (): ResumoMensal => {
    const entradasFiltradas = getEntradasFiltradas();
    const gastosFiltrados = getGastosFiltrados();
    const contasFiltradas = getContasFiltradas();

    const totalEntradas = entradasFiltradas.reduce((sum, e) => sum + e.valor, 0);
    const totalGastos = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);
    const saldo = totalEntradas - totalGastos;
    const percentualGastos = totalEntradas > 0 ? (totalGastos / totalEntradas) * 100 : 0;
    
    const contasPagas = contasFiltradas.filter(c => c.pago).length;
    const contasPendentes = contasFiltradas.filter(c => !c.pago).length;
    const valorPendente = contasFiltradas.filter(c => !c.pago).reduce((sum, c) => sum + c.valor, 0);

    return {
      totalEntradas,
      totalGastos,
      saldo,
      percentualGastos,
      contasPagas,
      contasPendentes,
      valorPendente,
    };
  };

  const getResumoPessoa = (pessoa: 'William' | 'Andressa'): ResumoPessoa => {
    const mesKey = getMesAnoKey();
    
    const entradasPessoa = supabaseData.entradas.filter(e => e.mes === mesKey && e.responsavel === pessoa);
    const gastosPessoa = supabaseData.gastos.filter(g => g.mes === mesKey && g.responsavel === pessoa);

    const totalEntradas = entradasPessoa.reduce((sum, e) => sum + e.valor, 0);
    const totalGastos = gastosPessoa.reduce((sum, g) => sum + g.valor, 0);
    const saldo = totalEntradas - totalGastos;

    const gastosPorCategoria: Record<string, number> = {};
    const contadorCategoria: Record<string, number> = {};
    
    gastosPessoa.forEach(g => {
      gastosPorCategoria[g.categoria] = (gastosPorCategoria[g.categoria] || 0) + g.valor;
      contadorCategoria[g.categoria] = (contadorCategoria[g.categoria] || 0) + 1;
    });

    const categoriasMaisUsadas = Object.entries(gastosPorCategoria)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
        quantidade: contadorCategoria[categoria]
      }))
      .sort((a, b) => b.valor - a.valor);

    return {
      totalEntradas,
      totalGastos,
      saldo,
      gastosPorCategoria,
      categoriasMaisUsadas,
    };
  };

  return (
    <FinanceContext.Provider value={{
      user: supabaseData.user,
      isLoading: supabaseData.isLoading,
      entradas: supabaseData.entradas,
      gastos: supabaseData.gastos,
      contas: supabaseData.contas,
      metas: supabaseData.metas,
      categoriasPersonalizadas: supabaseData.categoriasPersonalizadas,
      mesSelecionado,
      anoSelecionado,
      responsavelFiltro,
      setMesSelecionado,
      setAnoSelecionado,
      setResponsavelFiltro,
      addEntrada,
      addGasto,
      addConta,
      addMeta,
      addCategoriaPersonalizada,
      updateEntrada: supabaseData.updateEntrada,
      updateGasto: supabaseData.updateGasto,
      updateConta: supabaseData.updateConta,
      updateMeta: supabaseData.updateMeta,
      deleteEntrada: supabaseData.deleteEntrada,
      deleteGasto: supabaseData.deleteGasto,
      deleteConta: supabaseData.deleteConta,
      deleteMeta: supabaseData.deleteMeta,
      deleteCategoriaPersonalizada: supabaseData.deleteCategoriaPersonalizada,
      toggleContaPaga: supabaseData.toggleContaPaga,
      getResumoMensal,
      getResumoPessoa,
      getEntradasFiltradas,
      getGastosFiltrados,
      getContasFiltradas,
      getMetasFiltradas,
      getProgressoMeta,
      getCategoriasEntrada,
      getCategoriasGasto,
      signOut: supabaseData.signOut,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

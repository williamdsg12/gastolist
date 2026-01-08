import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Entrada, Gasto, Conta, Meta, ResumoMensal, ResumoPessoa, Responsavel, MESES, CATEGORIAS_ENTRADA, CATEGORIAS_GASTO } from '@/types/finance';

interface CategoriaPersonalizada {
  id: string;
  nome: string;
  tipo: 'entrada' | 'gasto';
  cor: string;
}

interface FinanceContextType {
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
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substring(2, 9);

const getCurrentMonth = () => MESES[new Date().getMonth()];
const getCurrentYear = () => new Date().getFullYear();

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [entradas, setEntradas] = useState<Entrada[]>(() => {
    const saved = localStorage.getItem('entradas');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [gastos, setGastos] = useState<Gasto[]>(() => {
    const saved = localStorage.getItem('gastos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [contas, setContas] = useState<Conta[]>(() => {
    const saved = localStorage.getItem('contas');
    return saved ? JSON.parse(saved) : [];
  });

  const [metas, setMetas] = useState<Meta[]>(() => {
    const saved = localStorage.getItem('metas');
    return saved ? JSON.parse(saved) : [];
  });

  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState<CategoriaPersonalizada[]>(() => {
    const saved = localStorage.getItem('categorias_personalizadas');
    return saved ? JSON.parse(saved) : [];
  });

  const [mesSelecionado, setMesSelecionado] = useState(getCurrentMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(getCurrentYear());
  const [responsavelFiltro, setResponsavelFiltro] = useState<Responsavel>('Todos');

  useEffect(() => {
    localStorage.setItem('entradas', JSON.stringify(entradas));
  }, [entradas]);

  useEffect(() => {
    localStorage.setItem('gastos', JSON.stringify(gastos));
  }, [gastos]);

  useEffect(() => {
    localStorage.setItem('contas', JSON.stringify(contas));
  }, [contas]);

  useEffect(() => {
    localStorage.setItem('metas', JSON.stringify(metas));
  }, [metas]);

  useEffect(() => {
    localStorage.setItem('categorias_personalizadas', JSON.stringify(categoriasPersonalizadas));
  }, [categoriasPersonalizadas]);

  const getMesAnoKey = () => `${mesSelecionado}-${anoSelecionado}`;

  const getCategoriasEntrada = () => {
    const personalizadas = categoriasPersonalizadas
      .filter(c => c.tipo === 'entrada')
      .map(c => c.nome);
    return [...CATEGORIAS_ENTRADA, ...personalizadas];
  };

  const getCategoriasGasto = () => {
    const personalizadas = categoriasPersonalizadas
      .filter(c => c.tipo === 'gasto')
      .map(c => c.nome);
    return [...CATEGORIAS_GASTO, ...personalizadas];
  };

  const addEntrada = (entrada: Omit<Entrada, 'id' | 'mes'>) => {
    const newEntrada: Entrada = {
      ...entrada,
      id: generateId(),
      mes: getMesAnoKey(),
    };
    setEntradas(prev => [...prev, newEntrada]);
  };

  const addGasto = (gasto: Omit<Gasto, 'id' | 'mes'>) => {
    const newGasto: Gasto = {
      ...gasto,
      id: generateId(),
      mes: getMesAnoKey(),
    };
    setGastos(prev => [...prev, newGasto]);
  };

  const addConta = (conta: Omit<Conta, 'id' | 'mes'>) => {
    const newConta: Conta = {
      ...conta,
      id: generateId(),
      mes: getMesAnoKey(),
    };
    setContas(prev => [...prev, newConta]);
  };

  const addMeta = (meta: Omit<Meta, 'id' | 'mes'>) => {
    const newMeta: Meta = {
      ...meta,
      id: generateId(),
      mes: getMesAnoKey(),
    };
    setMetas(prev => [...prev, newMeta]);
  };

  const addCategoriaPersonalizada = (cat: Omit<CategoriaPersonalizada, 'id'>) => {
    const newCat: CategoriaPersonalizada = {
      ...cat,
      id: generateId(),
    };
    setCategoriasPersonalizadas(prev => [...prev, newCat]);
  };

  const updateEntrada = (id: string, data: Partial<Entrada>) => {
    setEntradas(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const updateGasto = (id: string, data: Partial<Gasto>) => {
    setGastos(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };

  const updateConta = (id: string, data: Partial<Conta>) => {
    setContas(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const updateMeta = (id: string, data: Partial<Meta>) => {
    setMetas(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const deleteEntrada = (id: string) => {
    setEntradas(prev => prev.filter(e => e.id !== id));
  };

  const deleteGasto = (id: string) => {
    setGastos(prev => prev.filter(g => g.id !== id));
  };

  const deleteConta = (id: string) => {
    setContas(prev => prev.filter(c => c.id !== id));
  };

  const deleteMeta = (id: string) => {
    setMetas(prev => prev.filter(m => m.id !== id));
  };

  const deleteCategoriaPersonalizada = (id: string) => {
    setCategoriasPersonalizadas(prev => prev.filter(c => c.id !== id));
  };

  const toggleContaPaga = (id: string) => {
    setContas(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          pago: !c.pago,
          dataPagamento: !c.pago ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return c;
    }));
  };

  const getEntradasFiltradas = () => {
    return entradas.filter(e => {
      const matchMes = e.mes === getMesAnoKey();
      const matchResponsavel = responsavelFiltro === 'Todos' || e.responsavel === responsavelFiltro;
      return matchMes && matchResponsavel;
    });
  };

  const getGastosFiltrados = () => {
    return gastos.filter(g => {
      const matchMes = g.mes === getMesAnoKey();
      const matchResponsavel = responsavelFiltro === 'Todos' || g.responsavel === responsavelFiltro;
      return matchMes && matchResponsavel;
    });
  };

  const getContasFiltradas = () => {
    return contas.filter(c => {
      const matchMes = c.mes === getMesAnoKey();
      const matchResponsavel = responsavelFiltro === 'Todos' || c.responsavel === responsavelFiltro;
      return matchMes && matchResponsavel;
    });
  };

  const getMetasFiltradas = () => {
    return metas.filter(m => {
      const matchMes = m.mes === getMesAnoKey();
      const matchResponsavel = responsavelFiltro === 'Todos' || m.responsavel === 'Todos' || m.responsavel === responsavelFiltro;
      return matchMes && matchResponsavel;
    });
  };

  const getProgressoMeta = (meta: Meta): { atual: number; percentual: number } => {
    const mesKey = meta.mes;
    
    if (meta.tipo === 'economia') {
      const entradasMes = entradas.filter(e => e.mes === mesKey && (meta.responsavel === 'Todos' || e.responsavel === meta.responsavel));
      const gastosMes = gastos.filter(g => g.mes === mesKey && (meta.responsavel === 'Todos' || g.responsavel === meta.responsavel));
      const totalEntradas = entradasMes.reduce((s, e) => s + e.valor, 0);
      const totalGastos = gastosMes.reduce((s, g) => s + g.valor, 0);
      const economia = totalEntradas - totalGastos;
      return {
        atual: economia,
        percentual: meta.valorMeta > 0 ? Math.min((economia / meta.valorMeta) * 100, 100) : 0
      };
    } else if (meta.tipo === 'limite_gasto') {
      const gastosMes = gastos.filter(g => {
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
      const entradasMes = entradas.filter(e => {
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
    
    const entradasPessoa = entradas.filter(e => e.mes === mesKey && e.responsavel === pessoa);
    const gastosPessoa = gastos.filter(g => g.mes === mesKey && g.responsavel === pessoa);

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
      entradas,
      gastos,
      contas,
      metas,
      categoriasPersonalizadas,
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
      getResumoMensal,
      getResumoPessoa,
      getEntradasFiltradas,
      getGastosFiltrados,
      getContasFiltradas,
      getMetasFiltradas,
      getProgressoMeta,
      getCategoriasEntrada,
      getCategoriasGasto,
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
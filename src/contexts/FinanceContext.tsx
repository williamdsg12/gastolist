import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Entrada, Gasto, Conta, ResumoMensal, Responsavel, MESES } from '@/types/finance';

interface FinanceContextType {
  entradas: Entrada[];
  gastos: Gasto[];
  contas: Conta[];
  mesSelecionado: string;
  anoSelecionado: number;
  responsavelFiltro: Responsavel;
  setMesSelecionado: (mes: string) => void;
  setAnoSelecionado: (ano: number) => void;
  setResponsavelFiltro: (responsavel: Responsavel) => void;
  addEntrada: (entrada: Omit<Entrada, 'id' | 'mes'>) => void;
  addGasto: (gasto: Omit<Gasto, 'id' | 'mes'>) => void;
  addConta: (conta: Omit<Conta, 'id' | 'mes'>) => void;
  updateEntrada: (id: string, entrada: Partial<Entrada>) => void;
  updateGasto: (id: string, gasto: Partial<Gasto>) => void;
  updateConta: (id: string, conta: Partial<Conta>) => void;
  deleteEntrada: (id: string) => void;
  deleteGasto: (id: string) => void;
  deleteConta: (id: string) => void;
  toggleContaPaga: (id: string) => void;
  getResumoMensal: () => ResumoMensal;
  getEntradasFiltradas: () => Entrada[];
  getGastosFiltrados: () => Gasto[];
  getContasFiltradas: () => Conta[];
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

  const getMesAnoKey = () => `${mesSelecionado}-${anoSelecionado}`;

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

  const updateEntrada = (id: string, data: Partial<Entrada>) => {
    setEntradas(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };

  const updateGasto = (id: string, data: Partial<Gasto>) => {
    setGastos(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  };

  const updateConta = (id: string, data: Partial<Conta>) => {
    setContas(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
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

  return (
    <FinanceContext.Provider value={{
      entradas,
      gastos,
      contas,
      mesSelecionado,
      anoSelecionado,
      responsavelFiltro,
      setMesSelecionado,
      setAnoSelecionado,
      setResponsavelFiltro,
      addEntrada,
      addGasto,
      addConta,
      updateEntrada,
      updateGasto,
      updateConta,
      deleteEntrada,
      deleteGasto,
      deleteConta,
      toggleContaPaga,
      getResumoMensal,
      getEntradasFiltradas,
      getGastosFiltrados,
      getContasFiltradas,
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

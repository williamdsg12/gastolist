export interface Entrada {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
  responsavel: 'William' | 'Andressa';
  mes: string;
}

export interface Gasto {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
  responsavel: 'William' | 'Andressa';
  pago: boolean;
  mes: string;
}

export interface Conta {
  id: string;
  conta: string;
  valor: number;
  vencimento: string;
  pago: boolean;
  dataPagamento?: string;
  responsavel: 'William' | 'Andressa';
  mes: string;
}

export interface Meta {
  id: string;
  nome: string;
  valorMeta: number;
  tipo: 'economia' | 'limite_gasto' | 'entrada';
  categoria?: string;
  responsavel: 'William' | 'Andressa' | 'Todos';
  mes: string;
}

export interface ResumoMensal {
  totalEntradas: number;
  totalGastos: number;
  saldo: number;
  percentualGastos: number;
  contasPendentes: number;
  contasPagas: number;
  valorPendente: number;
}

export interface ResumoPessoa {
  totalEntradas: number;
  totalGastos: number;
  saldo: number;
  gastosPorCategoria: Record<string, number>;
  categoriasMaisUsadas: { categoria: string; valor: number; quantidade: number }[];
}

export type Responsavel = 'William' | 'Andressa' | 'Todos';

export const CATEGORIAS_ENTRADA = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Presente',
  'Outros'
];

export const CATEGORIAS_GASTO = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Roupas',
  'Outros'
];

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

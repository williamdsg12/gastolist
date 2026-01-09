export interface ItemCompra {
  id: string;
  produto: string;
  quantidade: number;
  unidade: string;
  preco: number;
  categoria: string;
  comprado: boolean;
  loja?: string;
  observacao?: string;
  foto_url?: string;
  data: string;
}

export const CATEGORIAS_COMPRAS = [
  'Frutas',
  'Verduras',
  'Carnes',
  'Laticínios',
  'Padaria',
  'Mercearia',
  'Bebidas',
  'Limpeza',
  'Higiene',
  'Outros',
];

export const UNIDADES = [
  'un',
  'kg',
  'g',
  'L',
  'ml',
  'pct',
  'cx',
  'dz',
];

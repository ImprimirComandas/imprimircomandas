
export interface Produto {
  nome: string;
  quantidade: number;
  valor: number;
}

export interface ProdutoFiltrado {
  id: string;
  nome: string;
  valor: number;
  numero?: number;
}

export interface Comanda {
  id: string;
  data: string;
  user_id: string;
  produtos: Produto[];
  total: number;
  forma_pagamento: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto';
  pago: boolean;
  troco: number;
  quantiapaga: number;
  valor_cartao: number;
  valor_dinheiro: number;
  valor_pix: number;
  bairro: string;
  taxaentrega: number;
  endereco: string;
}

export type Theme = 'light' | 'dark' | 'light-blue' | 'dark-purple';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}


export interface OrderProps {
  id: string;
  data: string;
  produtos: Array<{
    nome: string;
    quantidade: number;
    valor: number;
  }>;
  total: number;
  pago: boolean;
  forma_pagamento: string;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
  key: string;
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


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

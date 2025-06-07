
export interface AnalyticsDateRange {
  start: Date;
  end: Date;
}

export interface TopProduct {
  nome: string;
  categoria: string;
  quantidade_total: number;
  valor_total: number;
}

export interface NeighborhoodStats {
  bairro: string;
  total_entregas: number;
  valor_total: number;
  valor_medio: number;
}

export interface SalesData {
  date: string;
  total: number;
  orders: number;
}

export interface MotoboyStats {
  nome: string;
  total_entregas: number;
  valor_total: number;
}

export interface PaymentMethodStats {
  metodo: string;
  total: number;
  quantidade: number;
  porcentagem: number;
}

export interface HourlyStats {
  hora: number;
  total: number;
  pedidos: number;
}

export interface TotalStats {
  totalSales: number;
  totalOrders: number;
  totalDeliveries: number;
  averageOrderValue: number;
  totalConfirmed: number;
  totalUnconfirmed: number;
  conversionRate: number;
}

export interface AnalyticsData {
  topProducts: TopProduct[];
  leastProducts: TopProduct[];
  neighborhoodStats: NeighborhoodStats[];
  salesData: SalesData[];
  motoboyStats: MotoboyStats[];
  paymentMethods: PaymentMethodStats[];
  hourlyStats: HourlyStats[];
  totalStats: TotalStats;
}

export interface AnalyticsError {
  message: string;
  code?: string;
}


import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { DateRangeSelector } from '../components/orders/DateRangeSelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Package, MapPin, Truck, DollarSign, ShoppingCart, Calendar, RefreshCw, CreditCard, CheckCircle, XCircle, Clock, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DateRange } from 'react-date-range';
import { getInitialDateRange } from '../utils/dateUtils';

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange[]>(getInitialDateRange());
  
  const analyticsDateRange = dateRange[0].startDate && dateRange[0].endDate ? {
    start: dateRange[0].startDate,
    end: dateRange[0].endDate
  } : undefined;

  const { data, loading, refetch } = useAnalytics(analyticsDateRange);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Analytics da Loja</h1>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
        <p className="text-muted-foreground mb-4">
          Análise detalhada do desempenho da sua loja
        </p>
        
        {/* Seleção de Período */}
        <DateRangeSelector
          dateRange={dateRange}
          onDateChange={setDateRange}
          loading={loading}
        />
      </div>

      {/* KPIs Expandidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.totalStats.totalSales)}</div>
              <p className="text-xs text-muted-foreground">
                Total de vendas confirmadas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Confirmados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalStats.totalConfirmed}</div>
              <p className="text-xs text-muted-foreground">
                Taxa: {formatPercentage(data.totalStats.conversionRate)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalStats.totalUnconfirmed}</div>
              <p className="text-xs text-muted-foreground">
                Não confirmados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.totalStats.averageOrderValue)}</div>
              <p className="text-xs text-muted-foreground">
                Valor médio por pedido
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vendas por Período */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Vendas por Período
              </CardTitle>
              <CardDescription>Evolução das vendas no tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Formas de Pagamento */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Formas de Pagamento
              </CardTitle>
              <CardDescription>Distribuição por método de pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ metodo, porcentagem }) => `${metodo} ${formatPercentage(porcentagem)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {data.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vendas por Hora */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Vendas por Horário
              </CardTitle>
              <CardDescription>Performance por hora do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.hourlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                    labelFormatter={(label) => `${label}:00h`}
                  />
                  <Bar dataKey="total" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance dos Motoboys */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Performance dos Motoboys
              </CardTitle>
              <CardDescription>Top 10 entregas por motoboy</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.motoboyStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Entregas']}
                  />
                  <Bar dataKey="total_entregas" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabelas de Dados - Sem Scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top 10 Produtos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top 10 Produtos Mais Vendidos
              </CardTitle>
              <CardDescription>Produtos com maior quantidade vendida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <div key={product.nome} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="default">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.nome}</p>
                        <p className="text-sm text-muted-foreground">{product.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.quantidade_total} vendidos</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(product.valor_total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 10 Produtos Menos Vendidos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                10 Produtos Menos Vendidos
              </CardTitle>
              <CardDescription>Produtos que precisam de atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.leastProducts.map((product, index) => (
                  <div key={product.nome} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.nome}</p>
                        <p className="text-sm text-muted-foreground">{product.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.quantidade_total} vendidos</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(product.valor_total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Última linha - Bairros e Métodos de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Bairros */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top 10 Bairros - Entregas
              </CardTitle>
              <CardDescription>Áreas com mais entregas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.neighborhoodStats.map((neighborhood, index) => (
                  <div key={neighborhood.bairro} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{neighborhood.bairro}</p>
                        <p className="text-sm text-muted-foreground">
                          {neighborhood.total_entregas} entregas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(neighborhood.valor_total)}</p>
                      <p className="text-sm text-muted-foreground">
                        Média: {formatCurrency(neighborhood.valor_medio)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detalhes Formas de Pagamento */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Detalhes - Formas de Pagamento
              </CardTitle>
              <CardDescription>Análise detalhada por método</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.paymentMethods.map((method, index) => (
                  <div key={method.metodo} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium">{method.metodo}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.quantidade} pedidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(method.total)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPercentage(method.porcentagem)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

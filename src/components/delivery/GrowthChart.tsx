
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useTheme } from '@/hooks/useTheme';
import { TrendingUp } from 'lucide-react';
import { PeriodSelector, ChartPeriod } from '@/components/charts/PeriodSelector';
import { useChartData } from '@/hooks/useChartData';

export default function GrowthChart() {
  const { isDark, theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('week');
  const { chartData, loading } = useChartData(selectedPeriod);
  
  const isDarkGreen = theme === 'dark-green';

  // Colors based on the current theme
  const colors = {
    pedidos: isDarkGreen ? 'hsl(145, 70%, 45%)' : isDark ? 'hsl(var(--primary))' : 'hsl(var(--primary))',
    valor: isDarkGreen ? 'hsl(80, 70%, 45%)' : isDark ? 'hsl(153, 72%, 53%)' : 'hsl(210, 100%, 50%)',
    grid: 'hsl(var(--border))',
    text: 'hsl(var(--muted-foreground))'
  };

  // Custom tooltip style based on theme
  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.375rem',
    color: 'hsl(var(--foreground))',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  const getPeriodTitle = (period: ChartPeriod) => {
    switch (period) {
      case 'today': return 'Hoje';
      case 'week': return 'Últimos 7 dias';
      case 'month': return 'Último mês';
      case 'year': return 'Último ano';
      case 'all': return 'Histórico completo';
      default: return 'Crescimento e Desempenho';
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center text-foreground">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Crescimento e Desempenho - {getPeriodTitle(selectedPeriod)}
          </CardTitle>
          <PeriodSelector 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-primary"></div>
          </div>
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.pedidos} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.pedidos} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.valor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.valor} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="name" 
                stroke={colors.text} 
                style={{ fontSize: '12px' }} 
              />
              <YAxis 
                stroke={colors.text} 
                style={{ fontSize: '12px' }} 
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => {
                  return name === 'Valor' ? `R$ ${value.toFixed(2)}` : value;
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Pedidos" 
                stroke={colors.pedidos} 
                fillOpacity={1} 
                fill="url(#colorPedidos)" 
                activeDot={{ r: 6 }}
              />
              <Area 
                type="monotone" 
                dataKey="Valor" 
                stroke={colors.valor} 
                fillOpacity={1} 
                fill="url(#colorValor)" 
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Sem dados disponíveis para o período selecionado
          </div>
        )}
      </CardContent>
    </Card>
  );
}

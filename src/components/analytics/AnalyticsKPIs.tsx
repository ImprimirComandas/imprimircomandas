
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DollarSign, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercentage } from '../../utils/analyticsFormatters';
import type { TotalStats } from '../../types/analytics';

interface AnalyticsKPIsProps {
  totalStats: TotalStats;
}

const kpiConfig = [
  {
    key: 'totalSales' as keyof TotalStats,
    title: 'Vendas Totais',
    icon: DollarSign,
    format: formatCurrency,
    description: 'Total de vendas confirmadas',
    color: 'text-green-600',
  },
  {
    key: 'totalConfirmed' as keyof TotalStats,
    title: 'Pedidos Confirmados',
    icon: CheckCircle,
    format: (value: number) => value.toString(),
    description: (stats: TotalStats) => `Taxa: ${formatPercentage(stats.conversionRate)}`,
    color: 'text-green-500',
  },
  {
    key: 'totalUnconfirmed' as keyof TotalStats,
    title: 'Pedidos Pendentes',
    icon: XCircle,
    format: (value: number) => value.toString(),
    description: 'Não confirmados',
    color: 'text-red-500',
  },
  {
    key: 'averageOrderValue' as keyof TotalStats,
    title: 'Ticket Médio',
    icon: TrendingUp,
    format: formatCurrency,
    description: 'Valor médio por pedido',
    color: 'text-blue-600',
  },
];

export function AnalyticsKPIs({ totalStats }: AnalyticsKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiConfig.map((kpi, index) => {
        const value = totalStats[kpi.key] as number;
        const description = typeof kpi.description === 'function' 
          ? kpi.description(totalStats) 
          : kpi.description;

        return (
          <motion.div 
            key={kpi.key}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {kpi.format(value)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/analyticsFormatters';

interface AnalyticsSecondaryChartsProps {
  hourlyStats: Array<{ hora: number; total: number; pedidos: number }>;
  motoboyStats: Array<{ nome: string; total_entregas: number; valor_total: number }>;
}

export function AnalyticsSecondaryCharts({ hourlyStats, motoboyStats }: AnalyticsSecondaryChartsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
              Vendas por Horário
            </CardTitle>
            <CardDescription className="text-sm">Performance por hora do dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="lg:h-[300px]">
              <BarChart data={hourlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" fontSize={12} />
                <YAxis fontSize={12} />
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Truck className="h-4 w-4 lg:h-5 lg:w-5" />
              Performance dos Motoboys
            </CardTitle>
            <CardDescription className="text-sm">Top 10 entregas por motoboy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="lg:h-[300px]">
              <BarChart data={motoboyStats} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="nome" type="category" width={80} fontSize={10} />
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
  );
}

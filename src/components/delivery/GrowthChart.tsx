
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface GrowthChartProps {
  chartData: { name: string; Pedidos: number; Valor: number }[];
}

export default function GrowthChart({ chartData }: GrowthChartProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Crescimento dos Pedidos (Últimos 7 Dias)
      </h2>
      {chartData.length > 0 && chartData.some(d => d.Pedidos > 0 || d.Valor > 0) ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#374151" />
              <YAxis
                yAxisId="left"
                stroke="#34D399"
                label={{ value: 'Pedidos', angle: -90, position: 'insideLeft', offset: -10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#3B82F6"
                label={{ value: 'Valor (R$)', angle: 90, position: 'insideRight', offset: -10 }}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'Pedidos' ? `${value} pedidos` : `R$ ${value.toFixed(2)}`
                }
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Pedidos"
                stroke="#34D399"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Valor"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-600 text-center">Nenhum dado disponível para o gráfico.</p>
      )}
    </div>
  );
}

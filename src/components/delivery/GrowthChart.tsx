import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

interface GrowthChartProps {
  chartData: { name: string; Pedidos: number; Valor: number }[];
}

export default function GrowthChart({ chartData }: GrowthChartProps) {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2 className="text-lg font-medium text-gray-700 mb-3">
        Crescimento Mensal
      </h2>
      {chartData.length > 0 && chartData.some(d => d.Pedidos > 0 || d.Valor > 0) ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <XAxis
                dataKey="name"
                stroke="#000000"
                tick={{ fontSize: 12, fill: '#000000' }}
                tickLine={false}
                axisLine={{ stroke: '#000000' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#000000"
                tick={{ fontSize: 12, fill: '#000000' }}
                tickLine={false}
                axisLine={{ stroke: '#000000' }}
                label={{
                  value: 'Pedidos',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5,
                  fill: '#000000',
                  fontSize: 12,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#000000"
                tick={{ fontSize: 12, fill: '#000000' }}
                tickLine={false}
                axisLine={{ stroke: '#000000' }}
                label={{
                  value: 'Vendas (R$)',
                  angle: 90,
                  position: 'insideRight',
                  offset: -5,
                  fill: '#000000',
                  fontSize: 12,
                }}
              />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'Pedidos' ? `${value} pedidos` : `R$ ${value.toFixed(2)}`
                }
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  border: '1px solid #000000',
                  padding: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#000000', fontSize: '12px' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#000000' }}
                verticalAlign="bottom"
                height={24}
              />
              {/* Linhas verticais tracejadas para Pedidos */}
              {chartData.map((entry, index) => (
                <ReferenceLine
                  key={`pedidos-${index}`}
                  x={entry.name}
                  stroke="#1E90FF"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  yAxisId="left"
                  y={0}
                  ifOverflow="extendDomain"
                />
              ))}
              {/* Linhas verticais tracejadas para Valor */}
              {chartData.map((entry, index) => (
                <ReferenceLine
                  key={`valor-${index}`}
                  x={entry.name}
                  stroke="#000000"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  yAxisId="right"
                  y={0}
                  ifOverflow="extendDomain"
                />
              ))}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Pedidos"
                stroke="#1E90FF"
                strokeWidth={2}
                dot={{ r: 4, fill: '#1E90FF', stroke: '#1E90FF' }}
                activeDot={{ r: 6, fill: '#1E90FF', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Valor"
                stroke="#000000"
                strokeWidth={2}
                dot={{ r: 4, fill: '#000000', stroke: '#000000' }}
                activeDot={{ r: 6, fill: '#000000', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-500 text-center text-sm">Nenhum dado disponível para o gráfico.</p>
      )}
    </div>
  );
}
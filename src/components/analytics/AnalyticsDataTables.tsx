
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercentage } from '../../utils/analyticsFormatters';

interface AnalyticsDataTablesProps {
  topProducts: Array<{ nome: string; categoria: string; quantidade_total: number; valor_total: number }>;
  leastProducts: Array<{ nome: string; categoria: string; quantidade_total: number; valor_total: number }>;
  neighborhoodStats: Array<{ bairro: string; total_entregas: number; valor_total: number; valor_medio: number }>;
  paymentMethods: Array<{ metodo: string; total: number; quantidade: number; porcentagem: number }>;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export function AnalyticsDataTables({ topProducts, leastProducts, neighborhoodStats, paymentMethods }: AnalyticsDataTablesProps) {
  return (
    <>
      {/* Tabelas de Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                {topProducts.map((product, index) => (
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
                {leastProducts.map((product, index) => (
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
                {neighborhoodStats.map((neighborhood, index) => (
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
                {paymentMethods.map((method, index) => (
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
    </>
  );
}

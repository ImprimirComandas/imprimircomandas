
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />
                Top 10 Produtos Mais Vendidos
              </CardTitle>
              <CardDescription className="text-sm">Produtos com maior quantidade vendida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-hidden">
                {topProducts.slice(0, 10).map((product, index) => (
                  <div key={product.nome} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Badge variant="default" className="shrink-0">#{index + 1}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm lg:text-base truncate">{product.nome}</p>
                        <p className="text-xs lg:text-sm text-muted-foreground truncate">{product.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-medium text-sm lg:text-base">{product.quantidade_total} vendidos</p>
                      <p className="text-xs lg:text-sm text-muted-foreground">{formatCurrency(product.valor_total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <TrendingDown className="h-4 w-4 lg:h-5 lg:w-5" />
                10 Produtos Menos Vendidos
              </CardTitle>
              <CardDescription className="text-sm">Produtos que precisam de atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-hidden">
                {leastProducts.slice(0, 10).map((product, index) => (
                  <div key={product.nome} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Badge variant="secondary" className="shrink-0">#{index + 1}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm lg:text-base truncate">{product.nome}</p>
                        <p className="text-xs lg:text-sm text-muted-foreground truncate">{product.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-medium text-sm lg:text-base">{product.quantidade_total} vendidos</p>
                      <p className="text-xs lg:text-sm text-muted-foreground">{formatCurrency(product.valor_total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Última linha - Bairros e Métodos de Pagamento */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <MapPin className="h-4 w-4 lg:h-5 lg:w-5" />
                Top 10 Bairros - Entregas
              </CardTitle>
              <CardDescription className="text-sm">Áreas com mais entregas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-hidden">
                {neighborhoodStats.slice(0, 10).map((neighborhood, index) => (
                  <div key={neighborhood.bairro} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Badge variant="outline" className="shrink-0">#{index + 1}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm lg:text-base truncate">{neighborhood.bairro}</p>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          {neighborhood.total_entregas} entregas
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-medium text-sm lg:text-base">{formatCurrency(neighborhood.valor_total)}</p>
                      <p className="text-xs lg:text-sm text-muted-foreground">
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
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />
                Detalhes - Formas de Pagamento
              </CardTitle>
              <CardDescription className="text-sm">Análise detalhada por método</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-hidden">
                {paymentMethods.slice(0, 10).map((method, index) => (
                  <div key={method.metodo} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm lg:text-base truncate">{method.metodo}</p>
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          {method.quantidade} pedidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-medium text-sm lg:text-base">{formatCurrency(method.total)}</p>
                      <p className="text-xs lg:text-sm text-muted-foreground">
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

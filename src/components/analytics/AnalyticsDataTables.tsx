
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, formatPercentage } from '../../utils/analyticsFormatters';
import type { TopProduct, NeighborhoodStats, PaymentMethodStats } from '../../types/analytics';

interface AnalyticsDataTablesProps {
  topProducts: TopProduct[];
  leastProducts: TopProduct[];
  neighborhoodStats: NeighborhoodStats[];
  paymentMethods: PaymentMethodStats[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export function AnalyticsDataTables({ topProducts, leastProducts, neighborhoodStats, paymentMethods }: AnalyticsDataTablesProps) {
  return (
    <>
      {/* Product Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Top 10 Produtos Mais Vendidos
              </CardTitle>
              <CardDescription>Produtos com maior quantidade vendida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-80 overflow-hidden">
                {topProducts.map((product, index) => (
                  <div key={product.nome} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
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
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5" />
                10 Produtos Menos Vendidos
              </CardTitle>
              <CardDescription>Produtos que precisam de atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-80 overflow-hidden">
                {leastProducts.map((product, index) => (
                  <div key={product.nome} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
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

      {/* Neighborhoods and Payment Methods */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Top 10 Bairros - Entregas
              </CardTitle>
              <CardDescription>Áreas com mais entregas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-80 overflow-hidden">
                {neighborhoodStats.map((neighborhood, index) => (
                  <div key={neighborhood.bairro} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
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
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Detalhes - Formas de Pagamento
              </CardTitle>
              <CardDescription>Análise detalhada por método</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-80 overflow-hidden">
                {paymentMethods.map((method, index) => (
                  <div key={method.metodo} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
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


import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, Calendar } from 'lucide-react';

export function AnalyticsEmptyState() {
  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Nenhum dado encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Não há dados de vendas para o período selecionado.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Tente selecionar um período diferente ou faça algumas vendas primeiro</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AnalyticsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function AnalyticsErrorState({ error, onRetry }: AnalyticsErrorStateProps) {
  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl text-destructive">Erro ao carregar dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

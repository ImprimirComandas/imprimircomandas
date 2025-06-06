
import { Button } from '../ui/button';
import { DateRangeSelector } from '../orders/DateRangeSelector';
import { TrendingUp, RefreshCw } from 'lucide-react';
import type { DateRange } from 'react-date-range';

interface AnalyticsHeaderProps {
  dateRange: DateRange[];
  onDateChange: (ranges: DateRange[]) => void;
  loading: boolean;
  onRefetch: () => void;
}

export function AnalyticsHeader({ dateRange, onDateChange, loading, onRefetch }: AnalyticsHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Analytics da Loja</h1>
        </div>
        <Button variant="outline" size="sm" onClick={onRefetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
      <p className="text-muted-foreground mb-4">
        Análise detalhada do desempenho da sua loja
      </p>
      
      <DateRangeSelector
        dateRange={dateRange}
        onDateChange={onDateChange}
        loading={loading}
      />
    </div>
  );
}

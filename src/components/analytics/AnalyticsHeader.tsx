
import { Button } from '../ui/button';
import { AnalyticsDateRangeSelector } from './AnalyticsDateRangeSelector';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Analytics da Loja</h1>
            <p className="text-muted-foreground text-sm">
              Análise detalhada do desempenho da sua loja
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefetch}
          disabled={loading}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      
      <AnalyticsDateRangeSelector
        dateRange={dateRange}
        onDateChange={onDateChange}
        loading={loading}
      />
    </div>
  );
}

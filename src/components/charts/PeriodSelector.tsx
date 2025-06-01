
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp } from 'lucide-react';

export type ChartPeriod = 'today' | 'week' | 'month' | 'year' | 'all';

interface PeriodSelectorProps {
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  className?: string;
}

export function PeriodSelector({ selectedPeriod, onPeriodChange, className = '' }: PeriodSelectorProps) {
  const periods = [
    { key: 'today' as ChartPeriod, label: 'Hoje', icon: Calendar },
    { key: 'week' as ChartPeriod, label: '7 Dias', icon: TrendingUp },
    { key: 'month' as ChartPeriod, label: '1 Mês', icon: TrendingUp },
    { key: 'year' as ChartPeriod, label: '1 Ano', icon: TrendingUp },
    { key: 'all' as ChartPeriod, label: 'Tudo', icon: TrendingUp },
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {periods.map(({ key, label, icon: Icon }) => (
        <Button
          key={key}
          variant={selectedPeriod === key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodChange(key)}
          className="flex items-center gap-1"
        >
          <Icon size={14} />
          {label}
        </Button>
      ))}
    </div>
  );
}


import { cn } from './utils';
import React from 'react';

interface ChartProps {
  children: React.ReactNode;
}

interface ChartDataProps {
  data: any;
}

// Define types for the Recharts components without using JSX
export const RechartsPrimitive = {
  Chart: function Chart(props: ChartProps): React.ReactNode {
    return props.children;
  },
  Line: function Line(_props: ChartDataProps): React.ReactNode {
    return null;
  },
  Bar: function Bar(_props: ChartDataProps): React.ReactNode {
    return null;
  },
  Area: function Area(_props: ChartDataProps): React.ReactNode {
    return null;
  },
  Pie: function Pie(_props: ChartDataProps): React.ReactNode {
    return null;
  }
};

export function getPayloadConfigFromPayload(payload: any[]) {
  if (!payload || !payload.length) return null;
  return payload[0]?.payload || {};
}

export interface ChartContextType {
  type: 'line' | 'bar' | 'area' | 'pie';
  data: any[];
  categories?: string[];
  animated?: boolean;
}

export function useChart() {
  // Custom hook for chart state management
  // Can be extended in future with more functionality
  return {
    createChartOptions: (options: Partial<ChartContextType>) => ({
      type: options.type || 'line',
      data: options.data || [],
      categories: options.categories || [],
      animated: options.animated !== false,
    }),
    formatValue: (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
  };
}

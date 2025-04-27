
import React from 'react';
import LoadingSpinner from './stats/LoadingSpinner';
import NeighborhoodDetails from './stats/NeighborhoodDetails';
import StatsSummary from './stats/StatsSummary';

interface DeliveryStats {
  bairro: string;
  count: number;
}

interface DeliveryStatsProps {
  stats: {
    total: number;
    byNeighborhood: DeliveryStats[];
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
  isLoading: boolean;
}

export default function DeliveryStats({ stats, isExpanded, onToggleExpand, isLoading }: DeliveryStatsProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mt-2 border border-green-100">
      <StatsSummary 
        total={stats.total}
        hasNeighborhoods={stats.byNeighborhood.length > 0}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
      
      {stats.byNeighborhood.length > 0 ? (
        isExpanded && <NeighborhoodDetails items={stats.byNeighborhood} />
      ) : stats.total > 0 ? (
        <p className="text-xs text-gray-500 mt-1">
          Entregas sem bairro especificado
        </p>
      ) : (
        <p className="text-xs text-gray-500 mt-1">
          Nenhuma entrega registrada
        </p>
      )}
    </div>
  );
}

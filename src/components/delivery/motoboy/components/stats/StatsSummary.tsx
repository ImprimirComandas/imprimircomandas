
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatsSummaryProps {
  total: number;
  hasNeighborhoods: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function StatsSummary({ total, hasNeighborhoods, isExpanded, onToggleExpand }: StatsSummaryProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-800">Resumo de Entregas</h4>
        <Badge variant="outline" className="bg-green-50">
          Total: {total}
        </Badge>
      </div>
      
      {hasNeighborhoods && (
        <div className="mt-2">
          <button 
            onClick={onToggleExpand}
            className="text-xs text-blue-600 hover:underline flex items-center"
          >
            {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes por bairro'}
          </button>
        </div>
      )}
    </>
  );
}

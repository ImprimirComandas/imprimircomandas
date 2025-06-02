
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';

interface CategoryControlsProps {
  totalCategories: number;
  expandedCount: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function CategoryControls({
  totalCategories,
  expandedCount,
  onExpandAll,
  onCollapseAll
}: CategoryControlsProps) {
  if (totalCategories === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">
        {expandedCount} de {totalCategories} categoria{totalCategories !== 1 ? 's' : ''} expandida{expandedCount !== 1 ? 's' : ''}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExpandAll}
          disabled={expandedCount === totalCategories}
        >
          <ChevronDown className="h-4 w-4 mr-1" />
          Expandir Todas
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCollapseAll}
          disabled={expandedCount === 0}
        >
          <ChevronUp className="h-4 w-4 mr-1" />
          Recolher Todas
        </Button>
      </div>
    </div>
  );
}

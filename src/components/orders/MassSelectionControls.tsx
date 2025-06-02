
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Trash2, X } from 'lucide-react';

interface MassSelectionControlsProps {
  selectedCount: number;
  totalCount: number;
  isSelectAll: boolean;
  onToggleSelectAll: () => void;
  onConfirmPayments: () => void;
  onDeleteOrders: () => void;
  onClearSelection: () => void;
  loading: boolean;
}

export function MassSelectionControls({
  selectedCount,
  totalCount,
  isSelectAll,
  onToggleSelectAll,
  onConfirmPayments,
  onDeleteOrders,
  onClearSelection,
  loading
}: MassSelectionControlsProps) {
  if (selectedCount === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <Checkbox
          checked={isSelectAll}
          onCheckedChange={onToggleSelectAll}
          disabled={loading}
        />
        <span className="text-sm text-muted-foreground">
          Selecionar todos ({totalCount})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={selectedCount > 0}
          onCheckedChange={onToggleSelectAll}
          disabled={loading}
        />
        <span className="font-medium text-primary">
          {selectedCount} pedido{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onConfirmPayments}
          disabled={loading}
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <Check className="h-4 w-4 mr-1" />
          Confirmar Pagamento
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteOrders}
          disabled={loading}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
      </div>
    </div>
  );
}

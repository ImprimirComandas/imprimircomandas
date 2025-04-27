
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OrderFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: 'all' | 'paid' | 'pending';
  onFilterStatusChange: (status: 'all' | 'paid' | 'pending') => void;
}

export function OrderFilter({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange
}: OrderFilterProps) {
  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-auto">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <Input
          type="text"
          placeholder="Buscar pedido (8 últimos dígitos ou produto)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-64 pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-2 justify-center sm:justify-start">
        <Button
          onClick={() => onFilterStatusChange('all')}
          variant={filterStatus === 'all' ? 'default' : 'secondary'}
        >
          Todos
        </Button>
        <Button
          onClick={() => onFilterStatusChange('paid')}
          variant={filterStatus === 'paid' ? 'default' : 'secondary'}
        >
          Pagos
        </Button>
        <Button
          onClick={() => onFilterStatusChange('pending')}
          variant={filterStatus === 'pending' ? 'default' : 'secondary'}
        >
          Pendentes
        </Button>
      </div>
    </div>
  );
}

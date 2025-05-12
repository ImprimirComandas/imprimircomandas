
import { Search } from 'lucide-react';
import { Comanda } from '../../../types/database';
import { useTheme } from '@/hooks/useTheme';

interface ComandaSearchFieldProps {
  comandaId: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onClear: () => void;
  loading: boolean;
  comandaSearchResults: Comanda[];
  showComandaSearch: boolean;
  onSelect: (comanda: Comanda) => void;
  hasComandaId: boolean;
}

export function ComandaSearchField({
  comandaId,
  onChange,
  onSearch,
  onClear,
  loading,
  comandaSearchResults,
  showComandaSearch,
  onSelect,
  hasComandaId,
}: ComandaSearchFieldProps) {
  const { isDark, theme } = useTheme();
  
  return (
    <div className="mb-4">
      <label htmlFor="comandaId" className="block text-sm font-medium text-foreground mb-1">
        Buscar Pedido (Opcional)
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            id="comandaId"
            value={comandaId}
            onChange={onChange}
            placeholder="Digite os 8 últimos dígitos do pedido"
            className="w-full p-2 bg-background border border-input rounded-l-md text-foreground"
            disabled={loading}
          />
          {showComandaSearch && comandaSearchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {comandaSearchResults.map((comanda) => (
                <div
                  key={comanda.id}
                  onClick={() => onSelect(comanda)}
                  className="p-2 hover:bg-accent cursor-pointer"
                >
                  <div className="text-foreground">ID: {comanda.id?.slice(-8)}</div>
                  <div className="text-sm text-muted-foreground">
                    {comanda.bairro} - R${' '}
                    {(
                      comanda.forma_pagamento === 'dinheiro' &&
                      comanda.troco &&
                      comanda.troco > 0 &&
                      comanda.quantiapaga
                        ? comanda.quantiapaga
                        : comanda.total || 0
                    ).toFixed(2)}{' '}
                    - {comanda.forma_pagamento}
                  </div>
                </div>
              ))}
            </div>
          )}
          {comandaId && comandaSearchResults.length === 0 && !loading && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg p-2 text-center text-muted-foreground">
              Nenhum pedido encontrado
            </div>
          )}
          {loading && comandaId && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg p-2 text-center text-muted-foreground">
              Buscando...
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className="bg-primary text-primary-foreground p-2 rounded-r-md hover:bg-primary/90 flex items-center"
        >
          <Search size={18} />
        </button>
        {hasComandaId && (
          <button
            type="button"
            onClick={onClear}
            className="bg-destructive text-destructive-foreground p-2 rounded-md hover:bg-destructive/90 flex items-center"
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}

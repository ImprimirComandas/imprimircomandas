
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface DeliveryStatsProps {
  stats: {
    total: number;
    byNeighborhood: Array<{ bairro: string; count: number; }>;
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
  isLoading: boolean;
}

export default function DeliveryStats({
  stats,
  isExpanded,
  onToggleExpand,
  isLoading,
}: DeliveryStatsProps) {
  const { isDark } = useTheme();

  const renderStats = () => {
    if (isLoading) {
      return (
        <div className="py-2 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mx-auto mb-1"></div>
          Carregando estatísticas...
        </div>
      );
    }

    if (stats.total === 0) {
      return (
        <div className="py-1 text-center text-muted-foreground text-sm">
          Nenhuma entrega registrada ainda
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-muted-foreground">Total de entregas:</span>
          <span className="font-medium text-foreground">{stats.total}</span>
        </div>

        {stats.byNeighborhood.length > 0 && (
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-2 border-t border-border">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Por bairro:</h4>
                  <div className="max-h-32 overflow-y-auto pr-1">
                    {stats.byNeighborhood.map((item) => (
                      <div
                        key={item.bairro}
                        className="flex justify-between text-xs py-0.5"
                      >
                        <span className="text-foreground/70">{item.bairro}</span>
                        <span className="text-foreground font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </>
    );
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-2 mb-3 ${isDark ? 'bg-opacity-50' : ''}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">Entregas</span>
        {stats.byNeighborhood.length > 0 && (
          <button
            onClick={onToggleExpand}
            className={`h-5 w-5 flex items-center justify-center rounded-full ${isDark 
              ? 'hover:bg-white/10' 
              : 'hover:bg-black/10'}`}
          >
            {isExpanded ? (
              <ChevronUp size={14} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={14} className="text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {renderStats()}
    </div>
  );
}

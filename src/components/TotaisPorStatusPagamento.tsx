
import React from 'react';
import { motion } from 'framer-motion';
import { TotaisPorStatusPagamentoProps } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Card } from './ui/card';
import { CheckCircle, DollarSign } from 'lucide-react';

export default function TotaisPorStatusPagamento(props: TotaisPorStatusPagamentoProps) {
  const { isDark } = useTheme();
  
  // Handle both prop patterns for backward compatibility
  let confirmados = 0;
  let naoConfirmados = 0;
  let total = 0;
  
  if ('totais' in props && props.totais) {
    confirmados = props.totais.confirmados || 0;
    naoConfirmados = props.totais.naoConfirmados || 0;
    total = props.totais.total || 0;
  } else if ('confirmados' in props) {
    confirmados = props.confirmados || 0;
    naoConfirmados = props.naoConfirmados || 0;
    total = props.total || 0;
  }
  
  return (
    <Card className="p-5 border-border bg-card shadow-sm">
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        <DollarSign className="h-5 w-5 text-primary mr-2" />
        Status de Pagamentos - Hoje
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">Pagos</span>
            <span className="ml-2 bg-green-500/20 text-green-700 dark:text-green-400 px-1.5 py-0.5 text-xs rounded-md">
              ****
            </span>
          </div>
          <span className="text-lg font-medium text-foreground">
            R$ {confirmados.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">Pendentes</span>
            <span className="ml-2 bg-red-500/20 text-red-700 dark:text-red-400 px-1.5 py-0.5 text-xs rounded-md">
              ****
            </span>
          </div>
          <span className="text-lg font-medium text-foreground">
            R$ {naoConfirmados.toFixed(2)}
          </span>
        </div>

        <div className="pt-2 border-t border-border flex justify-between items-center">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">
            R$ {total.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
}

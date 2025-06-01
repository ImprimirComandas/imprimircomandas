
import React from 'react';
import { motion } from 'framer-motion';
import { TotaisPorStatusPagamentoProps } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { Card } from './ui/card';
import { CheckCircle, DollarSign, Clock, XCircle } from 'lucide-react';

export default function TotaisPorStatusPagamento(props: TotaisPorStatusPagamentoProps) {
  const { isDark } = useTheme();
  
  // Handle both prop patterns for backward compatibility
  let confirmados = 0;
  let naoConfirmados = 0;
  let total = 0;
  let totalPedidos = 0;
  let pedidosPagos = 0;
  let pedidosPendentes = 0;
  
  if ('totais' in props && props.totais) {
    confirmados = props.totais.confirmados || 0;
    naoConfirmados = props.totais.naoConfirmados || 0;
    total = props.totais.total || props.totais.geral || 0;
    // Get counts from the new totals structure
    pedidosPagos = props.totais.pedidosPagos || 0;
    pedidosPendentes = props.totais.pedidosPendentes || 0;
    totalPedidos = pedidosPagos + pedidosPendentes;
  } else if ('confirmados' in props) {
    confirmados = props.confirmados || 0;
    naoConfirmados = props.naoConfirmados || 0;
    total = props.total || 0;
    // For backward compatibility, don't show counts if not provided
  }
  
  return (
    <Card className="p-5 border-border bg-card shadow-sm">
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        <DollarSign className="h-5 w-5 text-primary mr-2" />
        Status de Pagamentos - Hoje
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <div>
              <span className="text-sm font-medium text-green-800 dark:text-green-300">Pedidos Pagos</span>
              {pedidosPagos > 0 && (
                <div className="text-xs text-green-600 dark:text-green-400">
                  {pedidosPagos} pedido{pedidosPagos > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          <span className="text-lg font-bold text-green-700 dark:text-green-300">
            R$ {confirmados.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <span className="text-sm font-medium text-red-800 dark:text-red-300">Pedidos Pendentes</span>
              {pedidosPendentes > 0 && (
                <div className="text-xs text-red-600 dark:text-red-400">
                  {pedidosPendentes} pedido{pedidosPendentes > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          <span className="text-lg font-bold text-red-700 dark:text-red-300">
            R$ {naoConfirmados.toFixed(2)}
          </span>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <div>
                <span className="text-sm font-semibold text-foreground">Total Geral</span>
                {totalPedidos > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {totalPedidos} pedido{totalPedidos > 1 ? 's' : ''} no total
                  </div>
                )}
              </div>
            </div>
            <span className="text-xl font-bold text-primary">
              R$ {total.toFixed(2)}
            </span>
          </div>
        </div>

        {totalPedidos > 0 && (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Taxa de Conversão</span>
              <span>{((pedidosPagos / totalPedidos) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(pedidosPagos / totalPedidos) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}


import React from 'react';
import { Card } from '../../../ui/card';
import { Play, Square, Edit, Trash2, Phone, DollarSign, Clock } from 'lucide-react';
import type { Motoboy, ExtendedMotoboySession } from '@/types';

interface MotoboyCardProps {
  motoboy: Motoboy;
  activeSession?: ExtendedMotoboySession;
  onStartSession: (motoboyId: string) => Promise<void>;
  onEndSession: () => void;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export function MotoboyCard({
  motoboy,
  activeSession,
  onStartSession,
  onEndSession,
  onEdit,
  onDelete,
  loading
}: MotoboyCardProps) {
  const isActive = !!activeSession;

  const getPaymentTypeLabel = (tipo?: string) => {
    switch (tipo) {
      case 'fixo': return 'Valor Fixo';
      case 'comissao': return 'Comissão';
      case 'fixo_comissao': return 'Fixo + Comissão';
      default: return 'Não definido';
    }
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className={`p-4 transition-all ${isActive ? 'ring-2 ring-green-500 bg-green-50/50 dark:bg-green-900/10' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg">{motoboy.nome}</h3>
          {motoboy.telefone && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Phone className="h-4 w-4 mr-1" />
              {motoboy.telefone}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            disabled={loading}
            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
            aria-label={`Editar ${motoboy.nome}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(motoboy.id!)}
            disabled={loading || isActive}
            className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 disabled:text-muted-foreground disabled:hover:bg-transparent transition-colors"
            aria-label={`Deletar ${motoboy.nome}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <DollarSign className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-muted-foreground">Pagamento:</span>
          <span className="font-medium ml-1">{getPaymentTypeLabel(motoboy.tipo_pagamento)}</span>
        </div>
        
        {motoboy.valor_fixo_sessao && motoboy.valor_fixo_sessao > 0 && (
          <div className="text-sm text-muted-foreground ml-6">
            Fixo: R$ {motoboy.valor_fixo_sessao.toFixed(2)}/sessão
          </div>
        )}
        
        {motoboy.taxa_comissao && motoboy.taxa_comissao > 0 && (
          <div className="text-sm text-muted-foreground ml-6">
            Comissão: R$ {motoboy.taxa_comissao.toFixed(2)}/entrega
          </div>
        )}
        
        {motoboy.entregas_para_desconto && motoboy.entregas_para_desconto > 0 && (
          <div className="text-sm text-muted-foreground ml-6">
            Desconto: {motoboy.entregas_para_desconto} entregas → -R$ {(motoboy.valor_desconto_entrega || 0).toFixed(2)}/entrega
          </div>
        )}
      </div>

      {isActive && activeSession && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center text-green-800 dark:text-green-300 text-sm font-medium">
            <Clock className="h-4 w-4 mr-2" />
            Sessão Ativa: {formatDuration(activeSession.start_time)}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!isActive ? (
          <button
            onClick={() => onStartSession(motoboy.id!)}
            disabled={loading}
            className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            Iniciar Sessão
          </button>
        ) : (
          <button
            onClick={onEndSession}
            disabled={loading}
            className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:bg-muted disabled:text-muted-foreground transition-colors"
          >
            <Square className="h-4 w-4 mr-2" />
            Encerrar Sessão
          </button>
        )}
      </div>
    </Card>
  );
}

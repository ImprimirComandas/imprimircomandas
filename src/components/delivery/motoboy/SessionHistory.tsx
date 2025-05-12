
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '../../ui/table';
import { Button } from '../../ui/button';
import { Package, X, Info, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';

// Import correct types from central types
import type { Motoboy, MotoboySession } from '../../../types';
interface Delivery {
  id: string;
  motoboy_id: string;
  bairro: string;
  created_at: string;
  valor_entrega: number;
  forma_pagamento: string;
  origem: string;
  comanda_id: string | null;
  status?: string;
  entregue?: boolean; // optional, to indicate delivered status
}

interface SessionHistoryProps {
  sessions: MotoboySession[];
  motoboys: Motoboy[];
  onRefresh?: () => void;
}

// Função utilitária para formatar data
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
};

// Função utilitária para calcular duração da sessão
const calculateSessionDuration = (start: string, end: string | null) => {
  const startTime = new Date(start);
  const endTime = end ? new Date(end) : new Date();
  const diffMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Função para calcular o pagamento do motoboy
const calculateMotoboyPayment = (session: MotoboySession, deliveries: Delivery[]): number => {
  const startTime = new Date(session.start_time);
  const endTime = session.end_time ? new Date(session.end_time) : new Date();
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  const basePayment = durationHours <= 6 ? 90 : 110;
  const totalDeliveries = deliveries.length;

  const deliveryValues = deliveries.reduce((sum, delivery) => sum + delivery.valor_entrega, 0);

  if (totalDeliveries <= 10) {
    return basePayment;
  } else {
    const baseForFirstTen = deliveries
      .slice(0, 10)
      .reduce((sum, delivery) => sum + delivery.valor_entrega, 0);
    return basePayment - baseForFirstTen + deliveryValues;
  }
};

export default function SessionHistory({ sessions, motoboys, onRefresh }: SessionHistoryProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null); // delivery being confirmed
  const { isDark } = useTheme();

  const fetchDeliveries = async (sessionId: string) => {
    setLoadingDeliveries(true);
    try {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      const startTime = new Date(session.start_time);
      const endTime = session.end_time ? new Date(session.end_time) : new Date();

      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .eq('motoboy_id', session.motoboy_id)
        .gte('created_at', startTime.toISOString())
        .lte('created_at', endTime.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDeliveries(data || []);
      setExpandedSession(sessionId);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error('Erro ao buscar entregas');
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const viewDeliveryDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDialogOpen(true);
  };

  const handleConfirmDelivery = async (delivery: Delivery) => {
    setConfirmingId(delivery.id);
    try {
      // Update entregue status in entregas table
      const { error } = await supabase
        .from('entregas')
        .update({ status: 'entregue' })
        .eq('id', delivery.id);

      if (error) throw error;

      toast.success('Entrega confirmada como entregue!');
      // Se houver comanda vinculada, atualizar status (ajuste caso queira mais lógica)
      // Aqui apenas para indicar vínculo visualmente, pois não está claro a lógica desejada para comanda

      // Refresh deliveries/UI
      fetchDeliveries(expandedSession!);
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      toast.error('Erro ao confirmar entrega');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDeliveryStatusChange = async (delivery: Delivery) => {
    try {
      // Update delivery status
      const { error } = await supabase
        .from('entregas')
        .update({ status: delivery.status === 'entregue' ? 'pendente' : 'entregue' })
        .eq('id', delivery.id);
        
      if (error) throw error;
      
      toast.success('Status da entrega atualizado com sucesso');
      
      // Refresh data if needed
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao atualizar status da entrega:', error);
      toast.error('Erro ao atualizar status da entrega');
    }
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-6 text-center text-muted-foreground border border-border">
        Nenhuma sessão registrada.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-card rounded-2xl shadow-lg p-6 border border-border"
    >
      <h2 className="text-2xl font-bold text-foreground mb-6">Histórico de Sessões</h2>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Motoboy
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Início
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fim
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Duração
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pagamento
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.slice(0, 10).map((session) => {
              const motoboy = motoboys.find((m) => m.id === session.motoboy_id);
              const isExpanded = expandedSession === session.id;
              const payment =
                isExpanded && deliveries.length > 0
                  ? calculateMotoboyPayment(session, deliveries)
                  : 0;

              return (
                <React.Fragment key={session.id}>
                  <TableRow className="hover:bg-accent/50">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {motoboy?.nome || 'Desconhecido'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {session.start_time ? formatDate(session.start_time) : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {session.end_time ? formatDate(session.end_time) : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {session.start_time
                        ? calculateSessionDuration(session.start_time, session.end_time)
                        : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {session.end_time === null ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                          Ativa
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
                          Finalizada
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {isExpanded && !loadingDeliveries
                        ? `R$ ${payment.toFixed(2)}`
                        : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedSession(null);
                          } else {
                            fetchDeliveries(session.id);
                          }
                        }}
                      >
                        {isExpanded ? (
                          <X className="h-4 w-4 mr-1" />
                        ) : (
                          <Package className="h-4 w-4 mr-1" />
                        )}
                        {isExpanded ? 'Fechar' : 'Ver Entregas'}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0 border-t-0">
                        <div className="bg-accent/30 p-4 rounded-md">
                          <h3 className="font-medium text-foreground mb-3">
                            Detalhes das Entregas
                          </h3>
                          <p className="text-sm text-foreground mb-2">
                            Total a pagar: <span className="font-bold">R$ {payment.toFixed(2)}</span>
                          </p>

                          {loadingDeliveries ? (
                            <div className="text-center py-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mx-auto"></div>
                              <p className="text-sm text-muted-foreground mt-2">
                                Carregando entregas...
                              </p>
                            </div>
                          ) : deliveries.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">
                              Nenhuma entrega registrada para esta sessão.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">ID</TableHead>
                                    <TableHead className="text-xs">Bairro</TableHead>
                                    <TableHead className="text-xs">Valor</TableHead>
                                    <TableHead className="text-xs">Data/Hora</TableHead>
                                    <TableHead className="text-xs">Ações</TableHead>
                                    <TableHead className="text-xs">Entregue</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {deliveries.map((delivery) => (
                                    <TableRow key={delivery.id} className="hover:bg-accent/50">
                                      <TableCell className="text-xs text-foreground">
                                        {delivery.comanda_id
                                          ? delivery.comanda_id.slice(-8)
                                          : delivery.id.slice(-8)}
                                      </TableCell>
                                      <TableCell className="text-xs text-foreground">
                                        {delivery.bairro}
                                      </TableCell>
                                      <TableCell className="text-xs text-foreground">
                                        R$ {delivery.valor_entrega.toFixed(2)}
                                      </TableCell>
                                      <TableCell className="text-xs text-foreground">
                                        {formatDate(delivery.created_at)}
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                          onClick={() => viewDeliveryDetails(delivery)}
                                        >
                                          <Info size={14} />
                                        </Button>
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={`h-8 px-2 ${
                                            delivery.status === 'entregue'
                                              ? 'text-green-600 dark:text-green-400'
                                              : 'text-amber-600 dark:text-amber-400'
                                          }`}
                                          onClick={() => handleDeliveryStatusChange(delivery)}
                                          disabled={confirmingId === delivery.id}
                                        >
                                          {confirmingId === delivery.id ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                          ) : delivery.status === 'entregue' ? (
                                            <Check size={14} />
                                          ) : (
                                            'Pendente'
                                          )}
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Entrega</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre esta entrega
            </DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-semibold text-muted-foreground">ID:</div>
                <div className="text-foreground">{selectedDelivery.id.slice(-8)}</div>
                
                <div className="font-semibold text-muted-foreground">Bairro:</div>
                <div className="text-foreground">{selectedDelivery.bairro}</div>
                
                <div className="font-semibold text-muted-foreground">Valor:</div>
                <div className="text-foreground">R$ {selectedDelivery.valor_entrega.toFixed(2)}</div>
                
                <div className="font-semibold text-muted-foreground">Forma Pagamento:</div>
                <div className="text-foreground">{selectedDelivery.forma_pagamento.toUpperCase()}</div>
                
                <div className="font-semibold text-muted-foreground">Origem:</div>
                <div className="text-foreground">{selectedDelivery.origem}</div>
                
                <div className="font-semibold text-muted-foreground">Status:</div>
                <div className={`font-medium ${
                  selectedDelivery.status === 'entregue' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {selectedDelivery.status === 'entregue' ? 'ENTREGUE' : 'PENDENTE'}
                </div>
                
                <div className="font-semibold text-muted-foreground">Data/Hora:</div>
                <div className="text-foreground">{formatDate(selectedDelivery.created_at)}</div>
              </div>
              
              {selectedDelivery.comanda_id && (
                <div className="mt-2 p-2 bg-primary/10 rounded">
                  <p className="text-xs text-muted-foreground">Pedido Vinculado:</p>
                  <p className="text-sm font-medium text-foreground">#{selectedDelivery.comanda_id.slice(-8)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fechar
            </Button>
            {selectedDelivery && selectedDelivery.status !== 'entregue' && (
              <Button onClick={() => {
                handleConfirmDelivery(selectedDelivery);
                setDialogOpen(false);
              }}>
                Confirmar Entrega
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

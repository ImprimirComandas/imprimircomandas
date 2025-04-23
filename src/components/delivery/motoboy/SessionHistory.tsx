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
import { Package, X, Info } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog';

// Tipos
interface Motoboy {
  id: string;
  nome: string;
  telefone: string;
  user_id: string;
  created_at: string;
}

interface MotoboySession {
  id: string;
  motoboy_id: string;
  start_time: string;
  end_time: string | null;
  user_id: string;
}

interface Delivery {
  id: string;
  motoboy_id: string;
  bairro: string;
  created_at: string;
  valor_entrega: number;
  forma_pagamento: string;
  origem: string;
  comanda_id: string | null;
}

interface SessionHistoryProps {
  sessions: MotoboySession[];
  motoboys: Motoboy[];
  onRefresh: () => void; // Callback para atualizar a lista de sessões/entregas
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
  // Calcula a duração da sessão em horas
  const startTime = new Date(session.start_time);
  const endTime = session.end_time ? new Date(session.end_time) : new Date();
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  // Base: R$90,00 (≤ 6 horas) ou R$110,00 (> 6 horas) para até 10 entregas
  const basePayment = durationHours <= 6 ? 90 : 110;
  const totalDeliveries = deliveries.length;

  // Soma os valores das entregas
  const deliveryValues = deliveries.reduce((sum, delivery) => sum + delivery.valor_entrega, 0);

  // Ajusta o pagamento: base para até 10 entregas, valores completos para mais entregas
  if (totalDeliveries <= 10) {
    return basePayment;
  } else {
    // Subtrai o valor base das primeiras 10 entregas e usa os valores reais
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

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 text-center text-gray-600">
        Nenhuma sessão registrada.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Sessões</h2>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motoboy
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Início
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fim
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duração
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pagamento
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <TableRow>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {motoboy?.nome || 'Desconhecido'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.start_time ? formatDate(session.start_time) : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.end_time ? formatDate(session.end_time) : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.start_time
                        ? calculateSessionDuration(session.start_time, session.end_time)
                        : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {session.end_time === null ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Ativa
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Finalizada
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                        <div className="bg-gray-50 p-4">
                          <h3 className="font-medium text-gray-700 mb-3">
                            Detalhes das Entregas
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Total a pagar: R$ {payment.toFixed(2)}
                          </p>

                          {loadingDeliveries ? (
                            <div className="text-center py-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                              <p className="text-sm text-gray-500 mt-2">
                                Carregando entregas...
                              </p>
                            </div>
                          ) : deliveries.length === 0 ? (
                            <p className="text-sm text-gray-500 py-2">
                              Nenhuma entrega registrada para esta sessão.
                            </p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">ID</TableHead>
                                  <TableHead className="text-xs">Bairro</TableHead>
                                  <TableHead className="text-xs">Valor</TableHead>
                                  <TableHead className="text-xs">Data/Hora</TableHead>
                                  <TableHead className="text-xs">Ações</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {deliveries.map((delivery) => (
                                  <TableRow key={delivery.id}>
                                    <TableCell className="text-xs">
                                      {delivery.comanda_id
                                        ? delivery.comanda_id.slice(-8)
                                        : delivery.id.slice(-8)}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {delivery.bairro}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      R$ {delivery.valor_entrega.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {format(new Date(delivery.created_at), 'dd/MM HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => viewDeliveryDetails(delivery)}
                                      >
                                        <Info className="h-3.5 w-3.5" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
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
              Informações da entrega{' '}
              {selectedDelivery?.comanda_id
                ? `#${selectedDelivery.comanda_id.slice(-8)}`
                : `ID: ${selectedDelivery?.id.slice(-8)}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Bairro</p>
                <p className="text-sm">{selectedDelivery?.bairro || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Valor</p>
                <p className="text-sm">
                  R$ {selectedDelivery?.valor_entrega.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Forma de Pagamento</p>
                <p className="text-sm capitalize">
                  {selectedDelivery?.forma_pagamento || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Origem</p>
                <p className="text-sm capitalize">
                  {selectedDelivery?.origem || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Data</p>
                <p className="text-sm">
                  {selectedDelivery
                    ? format(new Date(selectedDelivery.created_at), 'dd/MM/yyyy HH:mm')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
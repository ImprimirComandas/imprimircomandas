import React, { useState, useEffect } from 'react';
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
import { Package, X, Info, Truck } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { calculateMotoboyPayment, calculateSessionDuration, formatDate } from './utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '../../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

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
}

export default function SessionHistory({ sessions, motoboys }: SessionHistoryProps) {
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

  const handlePrint = async () => {
    try {
      const printContent = document.createElement('div');
      printContent.className = 'p-8';

      const header = document.createElement('div');
      header.innerHTML = `
        <h1 class="text-2xl font-bold mb-4">Relatório de Sessões de Entrega</h1>
        <p class="text-sm text-gray-500 mb-6">
          Período: ${format(new Date(sessions[sessions.length - 1]?.start_time || new Date()), 'dd/MM/yyyy')} 
          até ${format(new Date(sessions[0]?.start_time || new Date()), 'dd/MM/yyyy')}
        </p>
      `;
      printContent.appendChild(header);

      const table = document.createElement('table');
      table.className = 'w-full border-collapse';
      table.innerHTML = `
        <thead>
          <tr>
            <th class="border p-2 text-left">Motoboy</th>
            <th class="border p-2 text-left">Início</th>
            <th class="border p-2 text-left">Fim</th>
            <th class="border p-2 text-left">Duração</th>
            <th class="border p-2 text-left">Status</th>
            <th class="border p-2 text-left">Pagamento</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.map(session => {
            const motoboy = motoboys.find(m => m.id === session.motoboy_id);
            return `
              <tr>
                <td class="border p-2">${motoboy?.nome || 'Desconhecido'}</td>
                <td class="border p-2">${formatDate(session.start_time)}</td>
                <td class="border p-2">${session.end_time ? formatDate(session.end_time) : '-'}</td>
                <td class="border p-2">${calculateSessionDuration(session.start_time, session.end_time)}</td>
                <td class="border p-2">${session.end_time ? 'Finalizada' : 'Ativa'}</td>
                <td class="border p-2">R$ ${calculateMotoboyPayment(session, [], 'Jardim Paraíso', 6).payment.toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      `;
      printContent.appendChild(table);

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Relatório de Sessões</title>
              <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                @media print {
                  body { padding: 20px; }
                }
              </style>
            </head>
            <body>
              ${printContent.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório para impressão');
    }
  };

  const printSession = async (session: MotoboySession) => {
    try {
      const motoboy = motoboys.find(m => m.id === session.motoboy_id);
      const { data: deliveriesData } = await supabase
        .from('entregas')
        .select('*')
        .eq('motoboy_id', session.motoboy_id)
        .gte('created_at', session.start_time)
        .lte('created_at', session.end_time || new Date().toISOString());

      const deliveries = deliveriesData || [];
      const payment = calculateMotoboyPayment(
        session,
        deliveries,
        storeSettings.default_neighborhood,
        storeSettings.default_delivery_rate
      );

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Relatório de Sessão - ${motoboy?.nome || 'Motoboy'}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { font-size: 18px; margin-bottom: 10px; }
                .info { margin-bottom: 15px; }
                .info div { margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .total { font-weight: bold; margin-top: 15px; }
                @media print {
                  body { padding: 0; }
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <h1>Relatório de Sessão - ${motoboy?.nome || 'Motoboy'}</h1>
              <div class="info">
                <div>Início: ${formatDate(session.start_time)}</div>
                <div>Fim: ${session.end_time ? formatDate(session.end_time) : 'Em andamento'}</div>
                <div>Duração: ${calculateSessionDuration(session.start_time, session.end_time)}</div>
                <div>Total de Entregas: ${deliveries.length}</div>
              </div>
              
              <h2>Detalhes do Pagamento</h2>
              <div class="info">
                <div>Pagamento Base: R$ ${payment.details.basePayment.toFixed(2)}</div>
                <div>Adicional de Entregas: R$ ${payment.details.extraDeliveries.toFixed(2)}</div>
                <div>Adicional de Taxas: R$ ${payment.details.extraRates.toFixed(2)}</div>
                <div class="total">Total: R$ ${payment.payment.toFixed(2)}</div>
              </div>

              <h2>Entregas</h2>
              <table>
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Bairro</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  ${deliveries.map(delivery => `
                    <tr>
                      <td>${format(new Date(delivery.created_at), 'HH:mm')}</td>
                      <td>${delivery.bairro}</td>
                      <td>R$ ${delivery.valor_entrega.toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <button onclick="window.print();window.close()">Imprimir</button>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório para impressão');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('motoboy_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Sessão excluída com sucesso');
      if (onSessionDeleted) {
        onSessionDeleted();
      }
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir sessão:', error);
      toast.error(`Erro ao excluir sessão: ${error.message}`);
    }
  };

  const confirmDelete = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
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
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl p-4 md:p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Histórico de Sessões
      </h2>
      
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
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.slice(0, 10).map((session) => {
              const motoboy = motoboys.find(m => m.id === session.motoboy_id);
              const isExpanded = expandedSession === session.id;
              
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
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedSession(null);
                          } else {
                            fetchDeliveries(session.id);
                          }
                        }}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => printSession(session)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded deliveries section */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0 border-t-0">
                        <div className="bg-gray-50 p-4">
                          <h3 className="font-medium text-gray-700 mb-3">Detalhes das Entregas</h3>
                          
                          {loadingDeliveries ? (
                            <div className="text-center py-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                              <p className="text-sm text-gray-500 mt-2">Carregando entregas...</p>
                            </div>
                          ) : deliveries.length === 0 ? (
                            <p className="text-sm text-gray-500 py-2">Nenhuma entrega registrada para esta sessão.</p>
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
                                      {delivery.comanda_id ? 
                                        delivery.comanda_id.slice(-8) : 
                                        delivery.id.slice(-8)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import type { Comanda } from '../types/database';
import ComandasAnterioresModificado from '../components/ComandasAnterioresModificado';
import TotaisPorFormaPagamento from '../components/TotaisPorFormaPagamento';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import { toast } from 'sonner';
import { getUltimos8Digitos } from '../utils/printService';

export default function OrdersByDay() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComandas, setExpandedComandas] = useState<{ [key: string]: boolean }>({}); 
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [comandaSelecionada, setComandaSelecionada] = useState<Comanda | null>(null);

  const fetchOrdersByDate = async (date: Date) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }

      const startDate = startOfDay(date).toISOString();
      const endDate = endOfDay(date).toISOString();
      
      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar comandas:', error);
        toast.error('Erro ao carregar pedidos');
        return;
      }

      const comandasFormatadas = data?.map(comanda => ({
        ...comanda,
        produtos: Array.isArray(comanda.produtos) ? comanda.produtos : JSON.parse(comanda.produtos as any)
      })) || [];

      setComandas(comandasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar comandas do dia:', error);
      toast.error('Erro ao carregar pedidos do dia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersByDate(selectedDate);
  }, [selectedDate]);

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const toggleExpandComanda = (id: string) => {
    setExpandedComandas(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const reimprimirComanda = (comanda: Comanda) => {
    try {
      import('../utils/printService').then(module => {
        module.imprimirComanda(comanda);
        toast.success('Comanda enviada para impressão');
      });
    } catch (error) {
      console.error('Erro ao reimprimir comanda:', error);
      toast.error('Erro ao reimprimir comanda');
    }
  };

  const excluirComanda = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;

    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir comanda:', error);
        toast.error('Erro ao excluir o pedido');
        return;
      }

      fetchOrdersByDate(selectedDate);
      setExpandedComandas(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[id];
        return newExpanded;
      });
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir comanda:', error);
      toast.error('Erro ao excluir o pedido');
    }
  };

  const prepareConfirmPayment = (comanda: Comanda) => {
    setComandaSelecionada(comanda);
    setShowPaymentConfirmation(true);
  };

  const confirmarPagamento = async () => {
    if (!comandaSelecionada || !comandaSelecionada.id) return;
    
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comandaSelecionada.pago })
        .eq('id', comandaSelecionada.id);

      if (error) {
        console.error('Erro ao atualizar status de pagamento:', error);
        toast.error('Erro ao atualizar status de pagamento');
        return;
      }

      await fetchOrdersByDate(selectedDate);
      setShowPaymentConfirmation(false);
      
      const novoStatus = !comandaSelecionada.pago ? 'PAGO' : 'NÃO PAGO';
      toast.success(`Pedido marcado como ${novoStatus} com sucesso!`);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  const calcularTotais = () => {
    const totais = {
      pix: 0,
      dinheiro: 0,
      cartao: 0,
      geral: 0,
      confirmados: 0,
      naoConfirmados: 0
    };

    comandas.forEach(comanda => {
      if (comanda.pago) {
        totais.confirmados += comanda.total;
      } else {
        totais.naoConfirmados += comanda.total;
      }
      
      totais.geral += comanda.total;
      
      if (comanda.forma_pagamento === 'pix') {
        totais.pix += comanda.total;
      } else if (comanda.forma_pagamento === 'dinheiro') {
        totais.dinheiro += comanda.total;
      } else if (comanda.forma_pagamento === 'cartao') {
        totais.cartao += comanda.total;
      }
    });

    return totais;
  };

  const totais = calcularTotais();

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedidos por Dia</h1>
          
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
            <button 
              onClick={() => changeDate('prev')} 
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              <span className="text-lg font-medium">
                {format(selectedDate, 'dd/MM/yyyy')}
              </span>
            </div>
            
            <button 
              onClick={() => changeDate('next')} 
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <TotaisPorStatusPagamento 
          confirmados={totais.confirmados} 
          naoConfirmados={totais.naoConfirmados} 
          total={totais.geral} 
        />
        
        <TotaisPorFormaPagamento totais={totais} />
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : comandas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Nenhum pedido encontrado para esta data</p>
          </div>
        ) : (
          <ComandasAnterioresModificado 
            comandas={comandas}
            expandedComandas={expandedComandas}
            carregando={loading}
            onReimprimir={reimprimirComanda}
            onExcluir={excluirComanda}
            onToggleExpand={toggleExpandComanda}
            onConfirmPayment={prepareConfirmPayment}
          />
        )}
      </div>
      
      <PaymentConfirmationModal
        show={showPaymentConfirmation}
        comanda={comandaSelecionada}
        onClose={() => setShowPaymentConfirmation(false)}
        onConfirm={confirmarPagamento}
      />
    </div>
  );
}

interface TotaisPorStatusPagamentoProps {
  confirmados: number;
  naoConfirmados: number;
  total: number;
}

function TotaisPorStatusPagamento({ confirmados, naoConfirmados, total }: TotaisPorStatusPagamentoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <h2 className="text-lg md:text-xl font-bold mb-4">Status de Pagamentos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <p className="text-sm font-medium text-green-800">Confirmados</p>
          <p className="text-lg font-bold text-green-900">R$ {confirmados.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <p className="text-sm font-medium text-red-800">Não Confirmados</p>
          <p className="text-lg font-bold text-red-900">R$ {naoConfirmados.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="text-lg font-bold text-gray-900">R$ {total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

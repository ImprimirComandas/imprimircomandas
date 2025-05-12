
import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Comanda } from '@/types';
import { imprimirComanda } from '@/utils/printService';
import { startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from 'react-date-range';

export function useOrdersData() {
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');

  const fetchOrdersByPeriod = useCallback(async (dateRange: DateRange[]) => {
    setLoading(true);
    try {
      const startISO = startOfDay(dateRange[0].startDate || new Date()).toISOString();
      const endISO = endOfDay(dateRange[0].endDate || new Date()).toISOString();
      
      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .gte('data', startISO)
        .lte('data', endISO)
        .order('data', { ascending: false });

      if (error) throw new Error(`Erro ao carregar pedidos: ${error.message}`);
      setComandas(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar pedidos:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePayment = async (comanda: Comanda) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comanda.pago })
        .eq('id', comanda.id);

      if (error) throw new Error(`Erro ao atualizar pagamento: ${error.message}`);

      // Update local state
      setComandas(prev => prev.map(c => 
        c.id === comanda.id ? { ...c, pago: !c.pago } : c
      ));
      
      toast.success(`Pagamento ${!comanda.pago ? 'confirmado' : 'desmarcado'}!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return false;
    }
  };

  const reprintOrder = async (comanda: Comanda) => {
    try {
      // Ensure produtos is always an array
      const produtos = comanda.produtos || [];
      const subtotal = produtos.reduce((sum, p) => sum + (p.valor || 0) * (p.quantidade || 0), 0);
      const total = subtotal + (comanda.taxaentrega || comanda.taxa_entrega || 0);

      // Ensure forma_pagamento is one of the allowed values
      let paymentMethod: "" | "pix" | "dinheiro" | "cartao" | "misto" = "";
      if (comanda.forma_pagamento && ["", "pix", "dinheiro", "cartao", "misto"].includes(comanda.forma_pagamento)) {
        paymentMethod = comanda.forma_pagamento as "" | "pix" | "dinheiro" | "cartao" | "misto";
      }

      // Create a formatted comanda with all required fields and proper types
      const formattedComanda: Comanda = {
        ...comanda,
        id: comanda.id || crypto.randomUUID(),
        data: comanda.data || new Date().toISOString(), // Ensure data is always defined
        user_id: comanda.user_id || '',
        produtos: produtos.map(p => ({
          nome: p.nome || 'Produto desconhecido',
          quantidade: p.quantidade || 1, // Ensure quantidade is always defined
          valor: p.valor || p.preco || 0, // Ensure valor is always defined
        })),
        total: total, // Ensure total is always defined
        forma_pagamento: paymentMethod,
        pago: comanda.pago || false,
        troco: comanda.troco || 0,
        quantiapaga: comanda.quantiapaga || 0,
        valor_cartao: comanda.valor_cartao || 0,
        valor_dinheiro: comanda.valor_dinheiro || 0,
        valor_pix: comanda.valor_pix || 0,
        bairro: comanda.bairro || 'Não especificado',
        endereco: comanda.endereco || 'Não especificado',
        taxaentrega: comanda.taxaentrega || comanda.taxa_entrega || 0,
      };

      await imprimirComanda(formattedComanda);
      toast.success('Comanda enviada para impressão');
    } catch (error: unknown) {
      console.error('Erro ao reimprimir comanda:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao reimprimir comanda: ${errorMessage}`);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return false;

    try {
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir pedido: ${error.message}`);

      // Update local state
      setComandas(prev => prev.filter(c => c.id !== id));
      
      toast.success('Pedido excluído com sucesso!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return false;
    }
  };

  const saveOrderEdit = async (id: string, updatedComanda: Partial<Comanda>) => {
    try {
      const { error } = await supabase
        .from('comandas')
        .update(updatedComanda)
        .eq('id', id);

      if (error) throw new Error(`Erro ao salvar alterações: ${error.message}`);

      // Update local state
      setComandas(prev => prev.map(c => 
        c.id === id ? { ...c, ...updatedComanda } : c
      ));
      
      toast.success('Comanda atualizada com sucesso!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return false;
    }
  };

  const filteredOrders = useMemo(() => {
    return comandas.filter(comanda => {
      // For ID formatting, we'll need a utility function
      const getUltimos8Digitos = (id: string | undefined): string => {
        if (!id) return 'N/A';
        return id.slice(-8);
      };

      const matchesSearch = searchTerm
        ? getUltimos8Digitos(comanda.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
          comanda.produtos.some(p => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      const matchesStatus =
        filterStatus === 'all' ? true : filterStatus === 'paid' ? comanda.pago : !comanda.pago;

      return matchesSearch && matchesStatus;
    });
  }, [comandas, searchTerm, filterStatus]);

  const orderTotals = useMemo(() => {
    return filteredOrders.reduce(
      (acc, comanda) => {
        const valor = comanda.total || 0;
        acc.total += valor;
        if (comanda.pago) acc.confirmados += valor;
        else acc.naoConfirmados += valor;
        return acc;
      },
      { confirmados: 0, naoConfirmados: 0, total: 0 }
    );
  }, [filteredOrders]);

  return {
    comandas: filteredOrders,
    loading,
    totals: orderTotals,
    searchTerm,
    filterStatus,
    setSearchTerm,
    setFilterStatus,
    fetchOrdersByPeriod,
    togglePayment,
    reprintOrder,
    deleteOrder,
    saveOrderEdit
  };
}

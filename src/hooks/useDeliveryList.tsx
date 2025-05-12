
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Entrega, GroupedDeliveries } from '@/types';

export function useDeliveryList(selectedDate: Date) {
  const [deliveries, setDeliveries] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [motoboys, setMotoboys] = useState<any[]>([]);
  const [bairros, setBairros] = useState<any[]>([]);
  const [groupedDeliveries, setGroupedDeliveries] = useState<GroupedDeliveries>({});
  const [expandedMotoboys, setExpandedMotoboys] = useState<{[key: string]: boolean}>({});
  const [expandedDates, setExpandedDates] = useState<{[key: string]: boolean}>({});
  const [activeSessions, setActiveSessions] = useState<{[motoboyId: string]: boolean}>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<Entrega | null>(null);
  const [deliveryToEdit, setDeliveryToEdit] = useState<Entrega | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchBairros();
    fetchMotoboys();
    fetchActiveSessions();
    fetchDeliveries();
    
    // Set up real-time subscriptions
    const deliveriesChannel = supabase
      .channel('deliveries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entregas'
        },
        (payload) => {
          console.log('Real-time update from entregas:', payload);
          fetchDeliveries();
        }
      )
      .subscribe();
      
    const motoboySessionsChannel = supabase
      .channel('motoboy_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'motoboy_sessions'
        },
        (payload) => {
          console.log('Real-time update from motoboy_sessions:', payload);
          fetchActiveSessions();
        }
      )
      .subscribe();
      
    const motoboysChannel = supabase
      .channel('motoboys_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'motoboys'
        },
        (payload) => {
          console.log('Real-time update from motoboys:', payload);
          fetchMotoboys();
        }
      )
      .subscribe();
      
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(deliveriesChannel);
      supabase.removeChannel(motoboySessionsChannel);
      supabase.removeChannel(motoboysChannel);
    };
  }, [selectedDate]);

  const fetchBairros = async () => {
    try {
      const { data, error } = await supabase
        .from('bairros_taxas')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setBairros(data || []);
    } catch (error) {
      console.error('Erro ao carregar bairros:', error);
    }
  };

  const fetchMotoboys = async () => {
    try {
      const { data, error } = await supabase
        .from('motoboys')
        .select('id, nome');
      
      if (error) throw error;
      setMotoboys(data || []);
    } catch (error) {
      console.error('Erro ao carregar motoboys:', error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('motoboy_sessions')
        .select('motoboy_id')
        .is('end_time', null);
      
      if (error) throw error;
      
      const activeSessions: {[motoboyId: string]: boolean} = {};
      (data || []).forEach(session => {
        activeSessions[session.motoboy_id] = true;
      });
      
      setActiveSessions(activeSessions);
    } catch (error) {
      console.error('Erro ao carregar sessões ativas:', error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Entregas carregadas:', data);
      setDeliveries(data || []);
      groupDeliveriesByMotoboyAndDate(data || []);
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
      toast.error('Erro ao carregar entregas');
    } finally {
      setLoading(false);
    }
  };

  const groupDeliveriesByMotoboyAndDate = (deliveries: Entrega[]) => {
    const grouped: GroupedDeliveries = {};
    
    motoboys.forEach(motoboy => {
      grouped[motoboy.id] = {
        motoboyName: motoboy.nome,
        deliveriesByDate: {},
        totalValue: 0
      };
    });

    deliveries.forEach(delivery => {
      if (!delivery.created_at) return;
      
      if (grouped[delivery.motoboy_id]) {
        const deliveryDate = format(new Date(delivery.created_at), 'yyyy-MM-dd');
        
        if (!grouped[delivery.motoboy_id].deliveriesByDate[deliveryDate]) {
          grouped[delivery.motoboy_id].deliveriesByDate[deliveryDate] = [];
        }
        
        grouped[delivery.motoboy_id].deliveriesByDate[deliveryDate].push(delivery);
        grouped[delivery.motoboy_id].totalValue += delivery.valor_entrega;
      }
    });

    Object.keys(grouped).forEach(motoboyId => {
      if (Object.keys(grouped[motoboyId].deliveriesByDate).length === 0) {
        delete grouped[motoboyId];
      }
    });

    console.log('Grouped deliveries:', grouped);
    setGroupedDeliveries(grouped);
  };

  const toggleMotoboyExpand = (motoboyId: string) => {
    setExpandedMotoboys(prev => ({
      ...prev,
      [motoboyId]: !prev[motoboyId]
    }));
  };

  const toggleDateExpand = (dateKey: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  const confirmDeleteDelivery = (delivery: Entrega) => {
    setDeliveryToDelete(delivery);
    setDeleteDialogOpen(true);
  };

  const confirmEditDelivery = (delivery: Entrega) => {
    setDeliveryToEdit(delivery);
    setEditDialogOpen(true);
  };

  const handleDeleteDelivery = async () => {
    if (!deliveryToDelete || !deliveryToDelete.id) return;
    
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('entregas')
        .delete()
        .eq('id', deliveryToDelete.id);
      
      if (error) throw error;
      
      toast.success('Entrega removida com sucesso');
      fetchDeliveries();
    } catch (error) {
      console.error('Erro ao remover entrega:', error);
      toast.error('Erro ao remover entrega');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeliveryToDelete(null);
    }
  };

  const handleSaveEditedDelivery = async (editedDelivery: Entrega) => {
    if (!editedDelivery || !editedDelivery.id) return;
    
    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('entregas')
        .update({
          motoboy_id: editedDelivery.motoboy_id,
          bairro: editedDelivery.bairro,
          origem: editedDelivery.origem,
          valor_entrega: editedDelivery.valor_entrega,
          forma_pagamento: editedDelivery.forma_pagamento,
          pago: editedDelivery.pago
        })
        .eq('id', editedDelivery.id);
      
      if (error) throw error;
      
      toast.success('Entrega atualizada com sucesso');
      fetchDeliveries();
    } catch (error) {
      console.error('Erro ao atualizar entrega:', error);
      toast.error('Erro ao atualizar entrega');
    } finally {
      setEditLoading(false);
      setEditDialogOpen(false);
      setDeliveryToEdit(null);
    }
  };

  return {
    deliveries,
    loading,
    motoboys,
    bairros,
    groupedDeliveries,
    expandedMotoboys,
    expandedDates,
    activeSessions,
    deleteDialogOpen,
    editDialogOpen,
    deliveryToDelete,
    deliveryToEdit,
    deleteLoading,
    editLoading,
    setDeleteDialogOpen,
    setEditDialogOpen,
    toggleMotoboyExpand,
    toggleDateExpand,
    confirmDeleteDelivery,
    confirmEditDelivery,
    handleDeleteDelivery,
    handleSaveEditedDelivery
  };
}

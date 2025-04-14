import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Comanda } from '../types/database';

export const useDeliveryForm = () => {
  const [orderCodes, setOrderCodes] = useState<string[]>(['']);
  const [matchedComandas, setMatchedComandas] = useState<(Comanda | null)[]>([null]);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedMotoboy, setSelectedMotoboy] = useState('');
  const [deliveryValue, setDeliveryValue] = useState('');
  const [motoboys, setMotoboys] = useState<{ id: string; nome: string }[]>([]);
  const [pendingDeliveriesByMotoboy, setPendingDeliveriesByMotoboy] = useState<{ [key: string]: number }>({});
  const [loadingComandas, setLoadingComandas] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch motoboys
  useEffect(() => {
    const fetchMotoboys = async () => {
      const { data, error } = await supabase.from('motoboys').select('id, nome');
      if (error) {
        console.error('Error fetching motoboys:', error);
        toast.error('Erro ao carregar motoboys');
      } else {
        setMotoboys(data || []);
      }
    };
    fetchMotoboys();
  }, []);

  // Fetch pending deliveries
  useEffect(() => {
    const fetchPendingDeliveries = async () => {
      const { data, error } = await supabase
        .from('delivery')
        .select('motoboy_id')
        .eq('status', 'pending');
      if (error) {
        console.error('Error fetching pending deliveries:', error);
        toast.error('Erro ao carregar entregas pendentes');
      } else {
        const counts = data.reduce((acc, { motoboy_id }) => {
          acc[motoboy_id] = (acc[motoboy_id] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
        setPendingDeliveriesByMotoboy(counts);
      }
    };
    fetchPendingDeliveries();
  }, []);

  // Search comandas
  useEffect(() => {
    const fetchComandas = async () => {
      if (orderCodes.every((code) => !code.trim())) {
        setMatchedComandas(orderCodes.map(() => null));
        return;
      }
      setLoadingComandas(true);
      const newMatchedComandas = await Promise.all(
        orderCodes.map(async (code) => {
          if (!code.trim()) return null;
          const { data, error } = await supabase
            .from('comandas')
            .select('*')
            .eq('id', code)
            .single();
          if (error) {
            console.error(`Error fetching comanda ${code}:`, error);
            return null;
          }
          return data as Comanda;
        })
      );
      setMatchedComandas(newMatchedComandas);
      setLoadingComandas(false);
    };
    fetchComandas();
  }, [orderCodes]);

  // Add new order code input
  const addOrderCode = () => {
    setOrderCodes([...orderCodes, '']);
    setMatchedComandas([...matchedComandas, null]);
  };

  // Remove order code input
  const removeOrderCode = (index: number) => {
    if (orderCodes.length > 1) {
      setOrderCodes(orderCodes.filter((_, i) => i !== index));
      setMatchedComandas(matchedComandas.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatform || !selectedMotoboy) {
      toast.error('Por favor, selecione a plataforma e o motoboy');
      return;
    }
    if (matchedComandas.every((c) => !c)) {
      toast.error('Adicione pelo menos um pedido válido');
      return;
    }
    setLoading(true);
    const validComandaIds = matchedComandas
      .map((c, i) => (c ? c.id : null))
      .filter((id): id is string => !!id);
    const deliveryData = {
      comanda_ids: validComandaIds,
      platform: selectedPlatform,
      motoboy_id: selectedMotoboy,
      delivery_value: parseFloat(deliveryValue) || 0,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    console.log('Saving delivery:', deliveryData);
    const { error } = await supabase.from('delivery').insert([deliveryData]);
    if (error) {
      console.error('Error saving delivery:', error);
      toast.error(`Erro ao registrar entrega: ${error.message}`);
    } else {
      toast.success('Entrega(s) registrada(s) com sucesso');
      setOrderCodes(['']);
      setMatchedComandas([null]);
      setSelectedPlatform('');
      setSelectedMotoboy('');
      setDeliveryValue('');
    }
    setLoading(false);
  };

  return {
    orderCodes,
    setOrderCodes,
    addOrderCode,
    removeOrderCode,
    selectedPlatform,
    setSelectedPlatform,
    selectedMotoboy,
    setSelectedMotoboy,
    deliveryValue,
    setDeliveryValue,
    matchedComandas,
    loadingComandas,
    motoboys,
    pendingDeliveriesByMotoboy,
    loading,
    handleSubmit,
  };
};
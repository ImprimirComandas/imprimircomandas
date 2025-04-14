
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Comanda } from '../types/database';

type Motoboy = {
  id: string;
  nome: string;
  telefone?: string;
  placa?: string;
  status?: string;
};

type Delivery = {
  id: string;
  comanda_id?: string;
  motoboy_id: string;
  origem: string;
  endereco: string;
  bairro: string;
  status?: string;
  valor_entrega: number;
  data: string;
};

export const useDeliveryManagement = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [loadingComandas, setLoadingComandas] = useState(false);
  
  // State for motoboy form
  const [showMotoboyForm, setShowMotoboyForm] = useState(false);
  const [editingMotoboy, setEditingMotoboy] = useState<Motoboy | null>(null);
  const [motoboyName, setMotoboyName] = useState('');
  const [motoboyPhone, setMotoboyPhone] = useState('');
  const [motoboyPlate, setMotoboyPlate] = useState('');
  
  // State for delivery form
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('whatsapp');
  const [selectedMotoboy, setSelectedMotoboy] = useState<string>('');
  const [deliveryValue, setDeliveryValue] = useState('');
  const [matchedComanda, setMatchedComanda] = useState<Comanda | null>(null);
  
  // State for managing multiple deliveries
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [pendingDeliveriesByMotoboy, setPendingDeliveriesByMotoboy] = useState<{[key: string]: number}>({});

  // Load all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;
        setProfile(profileData);
        
        // Fetch motoboys
        await fetchMotoboys(session.user.id);
        
        // Fetch deliveries
        await fetchDeliveries(session.user.id);
        
        // Fetch all comandas for easier search
        await fetchComandas(session.user.id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Fetch motoboys data
  const fetchMotoboys = async (userId: string) => {
    try {
      const { data: motoboyData, error: motoboyError } = await supabase
        .from('motoboys')
        .select('*')
        .eq('user_id', userId)
        .order('nome');
      
      if (motoboyError) throw motoboyError;
      setMotoboys(motoboyData || []);
    } catch (error) {
      console.error('Error loading motoboys:', error);
      toast.error('Erro ao carregar motoboys');
    }
  };

  // Fetch deliveries data
  const fetchDeliveries = async (userId: string) => {
    try {
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('entregas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (deliveryError) throw deliveryError;
      setDeliveries(deliveryData || []);
      
      // Calculate pending deliveries by motoboy
      calculatePendingDeliveriesByMotoboy(deliveryData || []);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      toast.error('Erro ao carregar entregas');
    }
  };

  // Fetch comandas data
  const fetchComandas = async (userId: string) => {
    try {
      const { data: comandasData, error: comandasError } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (comandasError) throw comandasError;
      
      // Ensure produtos is properly parsed
      const processedComandas = (comandasData || []).map(comanda => ({
        ...comanda,
        produtos: Array.isArray(comanda.produtos) ? 
          comanda.produtos : 
          JSON.parse(comanda.produtos as any)
      }));
      
      setComandas(processedComandas);
    } catch (error) {
      console.error('Error loading comandas:', error);
      toast.error('Erro ao carregar comandas');
    }
  };
  
  // Calculate pending deliveries by motoboy
  const calculatePendingDeliveriesByMotoboy = (deliveryData: Delivery[]) => {
    const pendingByMotoboy: {[key: string]: number} = {};
    
    deliveryData.forEach(delivery => {
      if (delivery.status === 'pendente') {
        if (pendingByMotoboy[delivery.motoboy_id]) {
          pendingByMotoboy[delivery.motoboy_id]++;
        } else {
          pendingByMotoboy[delivery.motoboy_id] = 1;
        }
      }
    });
    
    setPendingDeliveriesByMotoboy(pendingByMotoboy);
  };
  
  // Search for comanda when order code changes
  useEffect(() => {
    if (!orderCode.trim()) {
      setMatchedComanda(null);
      return;
    }
    
    setLoadingComandas(true);
    
    // First try to find by exact ID
    const exactMatch = comandas.find(c => c.id === orderCode);
    
    // If no exact match, try to find by last 8 characters of ID (for convenience)
    const partialMatch = !exactMatch ? 
      comandas.find(c => c.id && c.id.endsWith(orderCode.slice(-8))) : 
      null;
    
    if (exactMatch) {
      setMatchedComanda(exactMatch);
    } else if (partialMatch) {
      setMatchedComanda(partialMatch);
    } else {
      setMatchedComanda(null);
    }
    
    setLoadingComandas(false);
  }, [orderCode, comandas]);
  
  // Reset motoboy form
  const resetMotoboyForm = () => {
    setEditingMotoboy(null);
    setMotoboyName('');
    setMotoboyPhone('');
    setMotoboyPlate('');
  };
  
  // Handle motoboy form submission
  const handleMotoboySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motoboyName.trim()) {
      toast.error('Nome do motoboy é obrigatório');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado');
        return;
      }
      
      const motoboyData = {
        nome: motoboyName,
        telefone: motoboyPhone,
        placa: motoboyPlate,
        user_id: session.user.id,
        status: 'ativo'
      };
      
      if (editingMotoboy) {
        // Update existing motoboy
        const { error } = await supabase
          .from('motoboys')
          .update(motoboyData)
          .eq('id', editingMotoboy.id);
        
        if (error) throw error;
        toast.success('Motoboy atualizado com sucesso');
      } else {
        // Create new motoboy
        const { error } = await supabase
          .from('motoboys')
          .insert([motoboyData]);
        
        if (error) throw error;
        toast.success('Motoboy cadastrado com sucesso');
      }
      
      // Refresh motoboys list
      await fetchMotoboys(session.user.id);
      
      // Reset form and hide it
      resetMotoboyForm();
      setShowMotoboyForm(false);
    } catch (error) {
      console.error('Error saving motoboy:', error);
      toast.error('Erro ao salvar motoboy');
    }
  };
  
  // Edit motoboy
  const handleEditMotoboy = (motoboy: Motoboy) => {
    setEditingMotoboy(motoboy);
    setMotoboyName(motoboy.nome);
    setMotoboyPhone(motoboy.telefone || '');
    setMotoboyPlate(motoboy.placa || '');
    setShowMotoboyForm(true);
  };
  
  // Delete motoboy
  const handleDeleteMotoboy = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este motoboy?')) return;
    
    try {
      const { error } = await supabase
        .from('motoboys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update motoboys list
      setMotoboys(motoboys.filter(m => m.id !== id));
      toast.success('Motoboy excluído com sucesso');
    } catch (error) {
      console.error('Error deleting motoboy:', error);
      toast.error('Erro ao excluir motoboy');
    }
  };
  
  // Handle delivery form submission
  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMotoboy) {
      toast.error('Selecione um motoboy');
      return;
    }
    
    if (!selectedPlatform) {
      toast.error('Selecione uma plataforma');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado');
        return;
      }
      
      const deliveryData = {
        motoboy_id: selectedMotoboy,
        origem: selectedPlatform,
        comanda_id: matchedComanda ? matchedComanda.id : null,
        valor_entrega: parseFloat(deliveryValue) || 0,
        endereco: matchedComanda ? matchedComanda.endereco : '',
        bairro: matchedComanda ? matchedComanda.bairro : '',
        status: 'pendente',
        user_id: session.user.id,
        data: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('entregas')
        .insert([deliveryData]);
      
      if (error) throw error;
      
      // Refresh deliveries list
      await fetchDeliveries(session.user.id);
      
      // Reset form and hide it
      setOrderCode('');
      setSelectedPlatform('whatsapp');
      setSelectedMotoboy('');
      setDeliveryValue('');
      setMatchedComanda(null);
      setShowDeliveryForm(false);
      toast.success('Entrega registrada com sucesso');
    } catch (error) {
      console.error('Error saving delivery:', error);
      toast.error('Erro ao registrar entrega');
    }
  };
  
  // Update delivery status
  const handleUpdateDeliveryStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('entregas')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update deliveries list
      const updatedDeliveries = deliveries.map(d => 
        d.id === id ? { ...d, status: newStatus } : d
      );
      setDeliveries(updatedDeliveries);
      calculatePendingDeliveriesByMotoboy(updatedDeliveries);
      
      toast.success(`Status atualizado para: ${newStatus}`);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Erro ao atualizar status da entrega');
    }
  };
  
  // Handle multiple deliveries selection
  const toggleDeliverySelection = (deliveryId: string) => {
    if (deliveryId === 'selectAll') {
      const pendingDeliveryIds = deliveries
        .filter(d => d.status === 'pendente')
        .map(d => d.id);
      setSelectedDeliveries(pendingDeliveryIds);
    } else if (deliveryId === 'clear') {
      setSelectedDeliveries([]);
    } else {
      setSelectedDeliveries(prev => {
        if (prev.includes(deliveryId)) {
          return prev.filter(id => id !== deliveryId);
        } else {
          return [...prev, deliveryId];
        }
      });
    }
  };
  
  // Assign selected deliveries to a motoboy
  const assignSelectedDeliveriesToMotoboy = async (motoboyId: string) => {
    if (selectedDeliveries.length === 0) {
      toast.error('Selecione pelo menos uma entrega para atribuir');
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado');
        return;
      }
      
      const updates = selectedDeliveries.map(deliveryId => 
        supabase
          .from('entregas')
          .update({ motoboy_id: motoboyId })
          .eq('id', deliveryId)
      );
      
      await Promise.all(updates);
      
      // Refresh deliveries list
      await fetchDeliveries(session.user.id);
      
      // Clear selection
      setSelectedDeliveries([]);
      toast.success('Entregas atribuídas com sucesso');
    } catch (error) {
      console.error('Error assigning deliveries:', error);
      toast.error('Erro ao atribuir entregas');
    }
  };
  
  // Get motoboy name by ID
  const getMotoboyName = (id: string) => {
    const motoboy = motoboys.find(m => m.id === id);
    return motoboy ? motoboy.nome : 'Não encontrado';
  };
  
  // Format platform name for display
  const formatPlatform = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp': return 'WhatsApp';
      case 'ifood': return 'iFood';
      case 'zedelivery': return 'Zé Delivery';
      default: return platform;
    }
  };

  return {
    profile,
    loading,
    motoboys,
    deliveries,
    comandas,
    loadingComandas,
    showMotoboyForm,
    setShowMotoboyForm,
    editingMotoboy,
    motoboyName,
    setMotoboyName,
    motoboyPhone,
    setMotoboyPhone,
    motoboyPlate,
    setMotoboyPlate,
    showDeliveryForm,
    setShowDeliveryForm,
    orderCode,
    setOrderCode,
    selectedPlatform,
    setSelectedPlatform,
    selectedMotoboy,
    setSelectedMotoboy,
    deliveryValue,
    setDeliveryValue,
    matchedComanda,
    selectedDeliveries,
    pendingDeliveriesByMotoboy,
    resetMotoboyForm,
    handleMotoboySubmit,
    handleEditMotoboy,
    handleDeleteMotoboy,
    handleDeliverySubmit,
    handleUpdateDeliveryStatus,
    toggleDeliverySelection,
    assignSelectedDeliveriesToMotoboy,
    getMotoboyName,
    formatPlatform,
    fetchData
  };
};

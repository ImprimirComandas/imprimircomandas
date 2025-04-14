
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Comanda } from '../types/database';
import { toast } from 'sonner';
import { Package, Truck, Search, Plus, Edit, Trash, Check, X } from 'lucide-react';

// Types for motoboys and deliveries
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

export default function TestPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
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

  // Load profile, motoboys, deliveries, and comandas on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
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
          const { data: motoboyData, error: motoboyError } = await supabase
            .from('motoboys')
            .select('*')
            .eq('user_id', session.user.id)
            .order('nome');
          
          if (motoboyError) throw motoboyError;
          setMotoboys(motoboyData || []);
          
          // Fetch deliveries
          const { data: deliveryData, error: deliveryError } = await supabase
            .from('entregas')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
          
          if (deliveryError) throw deliveryError;
          setDeliveries(deliveryData || []);
          
          // Calculate pending deliveries by motoboy
          calculatePendingDeliveriesByMotoboy(deliveryData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
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
    const searchComanda = async () => {
      if (!orderCode.trim()) {
        setMatchedComanda(null);
        return;
      }
      
      setLoadingComandas(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase
            .from('comandas')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('id', orderCode)
            .maybeSingle();
          
          if (error && error.code !== 'PGRST116') throw error;
          
          if (data) {
            // Convert produtos from JSONB to object if needed
            const comandaWithProducts = {
              ...data,
              produtos: Array.isArray(data.produtos) ? data.produtos : JSON.parse(data.produtos as any)
            };
            setMatchedComanda(comandaWithProducts);
          } else {
            setMatchedComanda(null);
          }
        }
      } catch (error) {
        console.error('Error searching for comanda:', error);
        toast.error('Erro ao buscar comanda');
        setMatchedComanda(null);
      } finally {
        setLoadingComandas(false);
      }
    };
    
    searchComanda();
  }, [orderCode]);
  
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
      const { data, error } = await supabase
        .from('motoboys')
        .select('*')
        .eq('user_id', session.user.id)
        .order('nome');
      
      if (error) throw error;
      setMotoboys(data || []);
      
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
      const { data, error: fetchError } = await supabase
        .from('entregas')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setDeliveries(data || []);
      calculatePendingDeliveriesByMotoboy(data || []);
      
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
    setSelectedDeliveries(prev => {
      if (prev.includes(deliveryId)) {
        return prev.filter(id => id !== deliveryId);
      } else {
        return [...prev, deliveryId];
      }
    });
  };
  
  // Assign selected deliveries to a motoboy
  const assignSelectedDeliveriesToMotoboy = async (motoboyId: string) => {
    if (selectedDeliveries.length === 0) {
      toast.error('Selecione pelo menos uma entrega para atribuir');
      return;
    }
    
    try {
      const updates = selectedDeliveries.map(deliveryId => 
        supabase
          .from('entregas')
          .update({ motoboy_id: motoboyId })
          .eq('id', deliveryId)
      );
      
      await Promise.all(updates);
      
      // Refresh deliveries list
      const { data, error } = await supabase
        .from('entregas')
        .select('*')
        .eq('user_id', profile?.id || '')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDeliveries(data || []);
      calculatePendingDeliveriesByMotoboy(data || []);
      
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gerenciamento de Entregas</h1>
          <p className="text-gray-600">Gerencie motoboys e entregas</p>
        </div>
        
        {/* Motoboys Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Motoboys
            </h2>
            <button 
              onClick={() => {
                resetMotoboyForm();
                setShowMotoboyForm(!showMotoboyForm);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
            >
              {showMotoboyForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {showMotoboyForm ? 'Cancelar' : 'Novo Motoboy'}
            </button>
          </div>
          
          {/* Motoboy Form */}
          {showMotoboyForm && (
            <form onSubmit={handleMotoboySubmit} className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome*</label>
                  <input
                    type="text"
                    value={motoboyName}
                    onChange={(e) => setMotoboyName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Nome do motoboy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={motoboyPhone}
                    onChange={(e) => setMotoboyPhone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Telefone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                  <input
                    type="text"
                    value={motoboyPlate}
                    onChange={(e) => setMotoboyPlate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Placa da moto"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  {editingMotoboy ? 'Atualizar' : 'Cadastrar'} Motoboy
                </button>
              </div>
            </form>
          )}
          
          {/* Motoboys List */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entregas Pendentes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {motoboys.length > 0 ? (
                  motoboys.map((motoboy) => (
                    <tr key={motoboy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{motoboy.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{motoboy.telefone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{motoboy.placa || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pendingDeliveriesByMotoboy[motoboy.id] > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pendingDeliveriesByMotoboy[motoboy.id] || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          motoboy.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {motoboy.status || 'ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditMotoboy(motoboy)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMotoboy(motoboy.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum motoboy cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Deliveries Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Entregas
            </h2>
            <button 
              onClick={() => setShowDeliveryForm(!showDeliveryForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
            >
              {showDeliveryForm ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {showDeliveryForm ? 'Cancelar' : 'Nova Entrega'}
            </button>
          </div>
          
          {/* Delivery Form */}
          {showDeliveryForm && (
            <form onSubmit={handleDeliverySubmit} className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código do Pedido</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={orderCode}
                      onChange={(e) => setOrderCode(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-l-md"
                      placeholder="Código do pedido"
                    />
                    <div className="bg-gray-200 text-gray-700 p-2 flex items-center justify-center rounded-r-md">
                      {loadingComandas ? (
                        <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
                      ) : (
                        <Search className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  {matchedComanda && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <Check className="inline h-4 w-4 mr-1" />
                        Comanda encontrada - {new Date(matchedComanda.data).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-green-800">
                        Total: R$ {matchedComanda.total.toFixed(2)} | {matchedComanda.bairro}
                      </p>
                      <p className="text-sm text-green-800">
                        Endereço: {matchedComanda.endereco}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma*</label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ifood">iFood</option>
                    <option value="zedelivery">Zé Delivery</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motoboy*</label>
                  <select
                    value={selectedMotoboy}
                    onChange={(e) => setSelectedMotoboy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Selecione um motoboy</option>
                    {motoboys.map((motoboy) => (
                      <option key={motoboy.id} value={motoboy.id}>
                        {motoboy.nome} ({pendingDeliveriesByMotoboy[motoboy.id] || 0} entregas pendentes)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Entrega</label>
                  <input
                    type="number"
                    value={deliveryValue}
                    onChange={(e) => setDeliveryValue(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Registrar Entrega
                </button>
              </div>
            </form>
          )}
          
          {/* Multiple Deliveries Management */}
          {selectedDeliveries.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
              <div className="text-blue-800">
                <span className="font-semibold">{selectedDeliveries.length}</span> entrega(s) selecionada(s)
              </div>
              <div className="flex items-center">
                {motoboys.length > 0 && (
                  <select
                    className="mr-2 p-2 border border-blue-300 rounded-md text-sm"
                    onChange={(e) => {
                      if (e.target.value) {
                        assignSelectedDeliveriesToMotoboy(e.target.value);
                      }
                    }}
                    value=""
                  >
                    <option value="">Atribuir para...</option>
                    {motoboys.map(motoboy => (
                      <option key={motoboy.id} value={motoboy.id}>{motoboy.nome}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => setSelectedDeliveries([])}
                  className="text-blue-600 hover:text-blue-800 p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Deliveries List */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={selectedDeliveries.length > 0 && selectedDeliveries.length === deliveries.filter(d => d.status === 'pendente').length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDeliveries(deliveries.filter(d => d.status === 'pendente').map(d => d.id));
                        } else {
                          setSelectedDeliveries([]);
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motoboy</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deliveries.length > 0 ? (
                  deliveries.map((delivery) => (
                    <tr key={delivery.id} className={`hover:bg-gray-50 ${selectedDeliveries.includes(delivery.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-2 py-3 whitespace-nowrap text-center">
                        {delivery.status === 'pendente' && (
                          <input 
                            type="checkbox" 
                            checked={selectedDeliveries.includes(delivery.id)}
                            onChange={() => toggleDeliverySelection(delivery.id)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(delivery.data).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatPlatform(delivery.origem)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        {getMotoboyName(delivery.motoboy_id)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {delivery.endereco ? `${delivery.endereco.substring(0, 20)}... (${delivery.bairro})` : '-'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        R$ {delivery.valor_entrega.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          delivery.status === 'entregue' ? 'bg-green-100 text-green-800' : 
                          delivery.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.status || 'pendente'}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                        {delivery.status !== 'entregue' ? (
                          <button
                            onClick={() => handleUpdateDeliveryStatus(delivery.id, 'entregue')}
                            className="text-green-600 hover:text-green-900 mr-2"
                            title="Marcar como entregue"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateDeliveryStatus(delivery.id, 'pendente')}
                            className="text-yellow-600 hover:text-yellow-900 mr-2"
                            title="Marcar como pendente"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhuma entrega registrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

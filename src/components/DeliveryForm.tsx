
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { MapPin, Truck, Search, Save } from 'lucide-react';
import type { Comanda } from '../types/database';

interface Motoboy {
  id: string;
  nome: string;
}

interface Entrega {
  id?: string;
  motoboy_id: string;
  comanda_id?: string | null;
  endereco: string;
  bairro: string;
  origem: string;
  valor_entrega: number;
}

export default function DeliveryForm() {
  const [loading, setLoading] = useState(false);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [bairros, setBairros] = useState<string[]>([]);
  const [comandaId, setComandaId] = useState('');
  const [comandaSearchResults, setComandaSearchResults] = useState<Comanda[]>([]);
  const [showComandaSearch, setShowComandaSearch] = useState(false);
  const [entrega, setEntrega] = useState<Entrega>({
    motoboy_id: '',
    endereco: '',
    bairro: '',
    origem: 'app',
    valor_entrega: 0
  });

  // Fetch motoboys and bairros when component loads
  useEffect(() => {
    fetchMotoboys();
    fetchBairros();
  }, []);

  // Fetch motoboys from database
  const fetchMotoboys = async () => {
    try {
      const { data, error } = await supabase
        .from('motoboys')
        .select('id, nome')
        .eq('status', 'ativo')
        .order('nome');
        
      if (error) throw error;
      setMotoboys(data || []);
      
      // Set the first motoboy as default if available
      if (data && data.length > 0) {
        setEntrega(prev => ({...prev, motoboy_id: data[0].id}));
      }
    } catch (error: any) {
      console.error('Error fetching motoboys:', error);
      toast.error(`Erro ao buscar motoboys: ${error.message}`);
    }
  };

  // Fetch bairros from database
  const fetchBairros = async () => {
    try {
      const { data, error } = await supabase
        .from('bairros_taxas')
        .select('nome')
        .order('nome');
        
      if (error) throw error;
      
      const uniqueBairros = [...new Set(data?.map(b => b.nome) || [])];
      setBairros(uniqueBairros);
      
      // Set the first bairro as default if available
      if (uniqueBairros.length > 0) {
        setEntrega(prev => ({...prev, bairro: uniqueBairros[0]}));
      }
    } catch (error: any) {
      console.error('Error fetching bairros:', error);
      toast.error(`Erro ao buscar bairros: ${error.message}`);
    }
  };

  // Search comanda by ID
  const searchComanda = async () => {
    if (!comandaId.trim()) {
      toast.error('Digite o ID do pedido');
      return;
    }
    
    setLoading(true);
    try {
      // Get the last 8 characters if the ID is longer
      const searchId = comandaId.trim().slice(-8);
      
      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .ilike('id', `%${searchId}%`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error('Pedido não encontrado');
        return;
      }
      
      setComandaSearchResults(data);
      setShowComandaSearch(true);
    } catch (error: any) {
      console.error('Error searching comanda:', error);
      toast.error(`Erro ao buscar pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Select comanda from search results
  const selectComanda = (comanda: Comanda) => {
    setEntrega(prev => ({
      ...prev,
      comanda_id: comanda.id,
      endereco: comanda.endereco,
      bairro: comanda.bairro,
      valor_entrega: comanda.taxaentrega
    }));
    setShowComandaSearch(false);
    setComandaId(comanda.id || '');
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEntrega(prev => ({
      ...prev,
      [name]: name === 'valor_entrega' ? parseFloat(value) || 0 : value
    }));
  };

  // Save delivery to database
  const saveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entrega.motoboy_id) {
      toast.error('Selecione um motoboy');
      return;
    }
    
    if (!entrega.endereco || !entrega.bairro) {
      toast.error('Preencha o endereço e o bairro');
      return;
    }
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }
      
      const newEntrega = {
        ...entrega,
        user_id: session.user.id
      };
      
      const { data, error } = await supabase
        .from('entregas')
        .insert([newEntrega])
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Entrega cadastrada com sucesso!');
      
      // Reset form
      setEntrega({
        motoboy_id: motoboys.length > 0 ? motoboys[0].id : '',
        endereco: '',
        bairro: bairros.length > 0 ? bairros[0] : '',
        origem: 'app',
        valor_entrega: 0
      });
      setComandaId('');
      
    } catch (error: any) {
      console.error('Error saving delivery:', error);
      toast.error(`Erro ao salvar entrega: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Truck className="mr-2" /> Cadastro de Entrega
      </h2>
      
      {/* Comanda Search */}
      <div className="mb-4">
        <label htmlFor="comandaId" className="block text-sm font-medium text-gray-700 mb-1">
          Buscar Pedido (Opcional)
        </label>
        <div className="flex">
          <div className="relative flex-1">
            <input
              type="text"
              id="comandaId"
              value={comandaId}
              onChange={(e) => setComandaId(e.target.value)}
              placeholder="Digite o ID do pedido"
              className="w-full p-2 border rounded-l-md"
            />
            {showComandaSearch && comandaSearchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {comandaSearchResults.map((comanda) => (
                  <div
                    key={comanda.id}
                    onClick={() => selectComanda(comanda)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div>ID: {comanda.id?.slice(-8)}</div>
                    <div className="text-sm text-gray-600">{comanda.endereco}</div>
                    <div className="text-sm text-gray-600">{comanda.bairro} - R$ {comanda.taxaentrega.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={searchComanda}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 flex items-center"
          >
            <Search size={18} />
          </button>
        </div>
      </div>
      
      <form onSubmit={saveDelivery}>
        {/* Motoboy Selection */}
        <div className="mb-4">
          <label htmlFor="motoboy_id" className="block text-sm font-medium text-gray-700 mb-1">
            Motoboy
          </label>
          <select
            id="motoboy_id"
            name="motoboy_id"
            value={entrega.motoboy_id}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Selecione um motoboy</option>
            {motoboys.map(motoboy => (
              <option key={motoboy.id} value={motoboy.id}>
                {motoboy.nome}
              </option>
            ))}
          </select>
        </div>
        
        {/* Address */}
        <div className="mb-4">
          <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <textarea
            id="endereco"
            name="endereco"
            value={entrega.endereco}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        {/* Neighborhood */}
        <div className="mb-4">
          <label htmlFor="bairro" className="block text-sm font-medium text-gray-700 mb-1">
            Bairro
          </label>
          <select
            id="bairro"
            name="bairro"
            value={entrega.bairro}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Selecione um bairro</option>
            {bairros.map(bairro => (
              <option key={bairro} value={bairro}>
                {bairro}
              </option>
            ))}
          </select>
        </div>
        
        {/* Origin */}
        <div className="mb-4">
          <label htmlFor="origem" className="block text-sm font-medium text-gray-700 mb-1">
            Origem
          </label>
          <select
            id="origem"
            name="origem"
            value={entrega.origem}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="app">Aplicativo</option>
            <option value="telefone">Telefone</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="ifood">iFood</option>
            <option value="outros">Outros</option>
          </select>
        </div>
        
        {/* Delivery Value */}
        <div className="mb-6">
          <label htmlFor="valor_entrega" className="block text-sm font-medium text-gray-700 mb-1">
            Valor da Entrega (R$)
          </label>
          <input
            type="number"
            id="valor_entrega"
            name="valor_entrega"
            value={entrega.valor_entrega}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 flex items-center justify-center ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={18} className="mr-2" />
          {loading ? 'Salvando...' : 'Salvar Entrega'}
        </button>
      </form>
    </div>
  );
}

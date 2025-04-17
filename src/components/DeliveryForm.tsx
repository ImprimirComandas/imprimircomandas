import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Truck, Search, Save } from 'lucide-react';
import { debounce } from 'lodash';

interface Motoboy {
  id: string;
  nome: string;
}

interface Comanda {
  id?: string;
  bairro?: string;
  taxaentrega?: number;
}

interface Entrega {
  id?: string;
  motoboy_id: string;
  comanda_id?: string | null;
  bairro: string;
  origem: string;
  valor_entrega: number;
}

export default function DeliveryForm() {
  const [loading, setLoading] = useState(false);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [bairros, setBairros] = useState<{ nome: string; taxaentrega: number }[]>([]);
  const [comandaId, setComandaId] = useState('');
  const [comandaSearchResults, setComandaSearchResults] = useState<Comanda[]>([]);
  const [showComandaSearch, setShowComandaSearch] = useState(false);
  const [entrega, setEntrega] = useState<Entrega>({
    motoboy_id: '',
    comanda_id: null,
    bairro: '',
    origem: 'app',
    valor_entrega: 0,
  });

  // Fetch motoboys and bairros when component loads
  useEffect(() => {
    fetchMotoboys();
    fetchBairros();
  }, []);

  // Fetch motoboys with active sessions
  const fetchMotoboys = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Fetch motoboys with active sessions (end_time is null)
      const { data, error } = await supabase
        .from('motoboys')
        .select('id, nome')
        .eq('user_id', session.user.id)
        .eq('status', 'ativo')
        .in('id', (await supabase
          .from('motoboy_sessions')
          .select('motoboy_id')
          .eq('user_id', session.user.id)
          .is('end_time', null)
        ).data?.map((session) => session.motoboy_id) || [])
        .order('nome');

      if (error) throw error;
      console.log('Fetched active motoboys:', data);
      setMotoboys(data || []);

      // Set the first active motoboy as default if available
      if (data && data.length > 0) {
        setEntrega((prev) => ({ ...prev, motoboy_id: data[0].id }));
      }
    } catch (error: any) {
      console.error('Error fetching motoboys:', error);
      toast.error(`Erro ao buscar motoboys: ${error.message}`);
    }
  };

  // Fetch bairros and their delivery fees
  const fetchBairros = async () => {
    try {
      const { data, error } = await supabase
        .from('bairros_taxas')
        .select('nome, taxaentrega')
        .order('nome');

      if (error) throw error;
      console.log('Fetched bairros:', data);
      setBairros(data || []);

      // Set the first bairro as default and update valor_entrega
      if (data && data.length > 0) {
        setEntrega((prev) => ({
          ...prev,
          bairro: data[0].nome,
          valor_entrega: data[0].taxaentrega || 0,
        }));
      }
    } catch (error: any) {
      console.error('Error fetching bairros:', error);
      toast.error(`Erro ao buscar bairros: ${error.message}`);
    }
  };

  // Update valor_entrega when bairro changes
  useEffect(() => {
    const selectedBairro = bairros.find((b) => b.nome === entrega.bairro);
    if (selectedBairro) {
      setEntrega((prev) => ({
        ...prev,
        valor_entrega: selectedBairro.taxaentrega || 0,
      }));
    }
  }, [entrega.bairro, bairros]);

  // Debounced comanda search
  const searchComanda = useCallback(
    debounce(async (searchId: string) => {
      if (!searchId.trim()) {
        setComandaSearchResults([]);
        setShowComandaSearch(false);
        return;
      }

      setLoading(true);
      try {
        const trimmedId = searchId.trim().slice(-8);
        const { data, error } = await supabase
          .from('comandas')
          .select('id, bairro, taxaentrega')
          .ilike('id', `%${trimmedId}%`)
          .order('created_at', { ascending: false })
          .limit(5); // Limit results to prevent overload

        if (error) throw error;
        console.log('Comanda search results:', data);
        setComandaSearchResults(data || []);
        setShowComandaSearch(true);
      } catch (error: any) {
        console.error('Error searching comanda:', error);
        toast.error(`Erro ao buscar pedido: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle comanda ID input change
  const handleComandaIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setComandaId(value);
    searchComanda(value);
  };

  // Select comanda from search results
  const selectComanda = (comanda: Comanda) => {
    setEntrega((prev) => ({
      ...prev,
      comanda_id: comanda.id || null,
      bairro: comanda.bairro || prev.bairro,
      valor_entrega: comanda.taxaentrega || prev.valor_entrega,
    }));
    setComandaId(comanda.id || '');
    setShowComandaSearch(false);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEntrega((prev) => ({
      ...prev,
      [name]: name === 'valor_entrega' ? parseFloat(value) || 0 : value,
    }));
  };

  // Save delivery to database
  const saveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entrega.motoboy_id) {
      toast.error('Selecione um motoboy ativo');
      return;
    }

    if (!entrega.bairro) {
      toast.error('Selecione um bairro');
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
        user_id: session.user.id,
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
        comanda_id: null,
        bairro: bairros.length > 0 ? bairros[0].nome : '',
        origem: 'app',
        valor_entrega: bairros.length > 0 ? bairros[0].taxaentrega : 0,
      });
      setComandaId('');
      setShowComandaSearch(false);
    } catch (error: any) {
      console.error('Error saving delivery:', error);
      toast.error(`Erro ao salvar entrega: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // If no active motoboys, show message
  if (motoboys.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-bold mb-4 flex items-center justify-center">
          <Truck className="mr-2" /> Cadastro de Entrega
        </h2>
        <p className="text-gray-600 mb-4">
          Nenhum motoboy ativo. Inicie uma sessão no gerenciamento de motoboys para contar o período de trabalho.
        </p>
        <a
          href="/motoboy-management" // Adjust URL to match your route
          className="inline-block bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Gerenciar Motoboys
        </a>
      </div>
    );
  }

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
              onChange={handleComandaIdChange}
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
                    <div className="text-sm text-gray-600">
                      {comanda.bairro} - R$ {comanda.taxaentrega?.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => searchComanda(comandaId)}
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
            {motoboys.map((motoboy) => (
              <option key={motoboy.id} value={motoboy.id}>
                {motoboy.nome}
              </option>
            ))}
          </select>
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
            {bairros.map((bairro) => (
              <option key={bairro.nome} value={bairro.nome}>
                {bairro.nome} (R$ {bairro.taxaentrega.toFixed(2)})
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
          disabled={loading || motoboys.length === 0}
          className={`w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 flex items-center justify-center ${
            loading || motoboys.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={18} className="mr-2" />
          {loading ? 'Salvando...' : 'Salvar Entrega'}
        </button>
      </form>
    </div>
  );
}
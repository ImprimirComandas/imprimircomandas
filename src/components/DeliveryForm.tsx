import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.ts';
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
  total?: number;
  quantiapaga?: number | null;
  forma_pagamento?: string;
  troco?: number | null;
}

interface Entrega {
  id?: string;
  motoboy_id: string;
  comanda_id?: string | null;
  bairro: string;
  origem: string;
  valor_entrega: number;
  forma_pagamento?: string; // Adicionado
}

export default function DeliveryForm({ onDeliveryAdded }: DeliveryFormProps) {
  const [loading, setLoading] = useState(false);
  const [motoboys, setMotoboys] = useState<Motoboy[]>([]);
  const [bairros, setBairros] = useState<BairroTaxa[]>([]);
  const [comandaId, setComandaId] = useState('');
  const [comandaSearchResults, setComandaSearchResults] = useState<Comanda[]>([]);
  const [showComandaSearch, setShowComandaSearch] = useState(false);
  const [entrega, setEntrega] = useState<Entrega>({
    motoboy_id: '',
    comanda_id: null,
    bairro: '',
    origem: 'whatsapp',
    valor_entrega: 0,
    valor_pedido: 0,
    forma_pagamento: '',
    pago: false,
  });

  useEffect(() => {
    console.log('DeliveryForm: onDeliveryAdded recebido?', typeof onDeliveryAdded === 'function');
  }, [onDeliveryAdded]);

  useEffect(() => {
    fetchMotoboys();
    fetchBairros();
  }, []);

  // Buscar motoboys ativos
  const fetchMotoboys = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const { data: activeSessions, error: sessionsError } = await supabase
        .from('motoboy_sessions')
        .select('motoboy_id')
        .eq('user_id', user.id)
        .is('end_time', null);

      if (sessionsError) throw sessionsError;

      if (!activeSessions || activeSessions.length === 0) {
        setMotoboys([]);
        return;
      }

      const activeMotoboyIds = activeSessions.map((s) => s.motoboy_id);

      const { data, error } = await supabase
        .from('motoboys')
        .select('id, nome')
        .eq('user_id', user.id)
        .eq('status', 'ativo')
        .in('id', activeMotoboyIds)
        .order('nome');

      if (error) throw error;
      setMotoboys(data || []);

      if (data && data.length > 0) {
        setEntrega((prev) => ({ ...prev, motoboy_id: data[0].id }));
      }
    } catch (error: any) {
      console.error('Erro ao buscar motoboys:', error);
      toast.error(`Erro ao buscar motoboys: ${error.message}`);
    }
  };

  const fetchBairros = async () => {
    try {
      const { data, error } = await supabase
        .from('bairros_taxas')
        .select('id, nome, taxa, user_id')
        .order('nome');

      if (error) throw error;
      console.log('Bairros:', data);
      setBairros(data || []);

      if (data && data.length > 0) {
        setBairros(data || []);
        setEntrega((prev) => ({
          ...prev,
          bairro: data[0].nome,
          valor_entrega: data[0].taxa || 0,
        }));
      } else {
        setBairros([]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar bairros:', error);
      toast.error(`Erro ao buscar bairros: ${error.message}`);
    }
  };

  const searchComanda = useCallback(
    debounce(async (searchId: string) => {
      if (!searchId.trim()) {
        setComandaSearchResults([]);
        setShowComandaSearch(false);
        return;
      }

      setLoading(true);
      try {
        const trimmedId = searchId.trim().toLowerCase();
        const { data, error } = await supabase
          .rpc('search_comandas_by_last_8', { search_term: trimmedId });

        if (error) throw error;
        setComandaSearchResults(data || []);
        setShowComandaSearch(true);
      } catch (error: any) {
        console.error('Erro ao pesquisar comanda:', error);
        toast.error(`Erro ao buscar pedido: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleComandaIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setComandaId(value);
    searchComanda(value);
  };

  const selectComanda = (comanda: Comanda) => {
    const valorPedido =
      comanda.forma_pagamento === 'dinheiro' &&
      comanda.troco &&
      comanda.troco > 0 &&
      comanda.quantiapaga
        ? comanda.quantiapaga
        : comanda.total || 0;

    setEntrega((prev) => ({
      ...prev,
      comanda_id: comanda.id || null,
      bairro: selectedBairro?.nome || prev.bairro,
      valor_entrega: taxaBairro,
      valor_pedido: valorPedido,
      forma_pagamento: comanda.forma_pagamento || '',
      pago: comanda.pago || false,
    }));
    setComandaId(comanda.id?.slice(-8) || '');
    setShowComandaSearch(false);
  };

  const clearComanda = () => {
    setEntrega((prev) => ({
      ...prev,
      comanda_id: null,
      bairro: bairros.length > 0 ? bairros[0].nome : '',
      valor_entrega: bairros.length > 0 ? bairros[0].taxa : 0,
      valor_pedido: 0,
      forma_pagamento: '',
      pago: false,
    }));
    setComandaId('');
    setComandaSearchResults([]);
    setShowComandaSearch(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'bairro') {
      const selectedBairro = bairros.find((b) => b.nome === value);
      setEntrega((prev) => ({
        ...prev,
        bairro: value,
        valor_entrega: selectedBairro?.taxa || 0,
      }));
    } else {
      setEntrega((prev) => ({
        ...prev,
        [name]: name === 'valor_entrega' || name === 'valor_pedido' ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setEntrega((prev) => ({
      ...prev,
      [name]: name === 'valor_entrega' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    setEntrega((prev) => ({
      ...prev,
      forma_pagamento: forma,
    }));
  };

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
  
    if (entrega.valor_entrega <= 0) {
      toast.error('A taxa de entrega deve ser maior que zero');
      return;
    }
  
    if (!entrega.forma_pagamento) {
      toast.error('Selecione uma forma de pagamento');
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
      setEntrega({
        motoboy_id: motoboys.length > 0 ? motoboys[0].id : '',
        comanda_id: null,
        bairro: bairros.length > 0 ? bairros[0].nome : '',
        origem: 'whatsapp',
        valor_entrega: bairros.length > 0 ? bairros[0].taxa : 0,
        valor_pedido: 0,
        forma_pagamento: '',
      });
      setComandaId('');
      setComandaSearchResults([]);
      setShowComandaSearch(false);
    } catch (error: any) {
      console.error('saveDelivery: Erro geral:', {
        message: error.message,
        stack: error.stack,
      });
      toast.error(`Erro ao salvar entrega: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      console.log('saveDelivery: Processo finalizado');
    }
  };

  // Mensagem para nenhum motoboy
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
          href="/motoboy-management"
          className="inline-block bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Gerenciar Motoboys
        </a>
      </div>
    );
  }

  const deliveryValueLabel = entrega.comanda_id
    ? 'Taxa de Entrega (R$)'
    : 'Taxa de Entrega (R$)';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Truck className="mr-2" /> Cadastro de Entrega
      </h2>

      <div className="mb-4">
        <label htmlFor="comandaId" className="block text-sm font-medium text-gray-700 mb-1">
          Buscar Pedido (Opcional)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              id="comandaId"
              value={comandaId}
              onChange={handleComandaIdChange}
              placeholder="Digite os 8 últimos dígitos do pedido"
              className="w-full p-2 border rounded-l-md"
              disabled={loading}
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
                      {comanda.bairro} - R${' '}
                      {(
                        comanda.forma_pagamento === 'dinheiro' &&
                        comanda.troco &&
                        comanda.troco > 0 &&
                        comanda.quantiapaga
                          ? comanda.quantiapaga
                          : comanda.total || 0
                      ).toFixed(2)}{' '}
                      - {comanda.forma_pagamento}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {comandaId && comandaSearchResults.length === 0 && !loading && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-2 text-center text-gray-500">
                Nenhum pedido encontrado
              </div>
            )}
            {loading && comandaId && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg p-2 text-center text-gray-500">
                Buscando...
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
          {entrega.comanda_id && (
            <button
              type="button"
              onClick={clearComanda}
              className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 flex items-center"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <form onSubmit={saveDelivery}>
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
                {bairro.nome} (R$ {bairro.taxa.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

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
            <option value="whatsapp">WhatsApp</option>
            <option value="ze_delivery">Zé Delivery</option>
            <option value="ifood">iFood</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Forma de Pagamento
          </label>
          {entrega.comanda_id ? (
            <div className="w-full p-2 border rounded-md bg-gray-100 text-gray-700">
              {entrega.forma_pagamento
                ? entrega.forma_pagamento.charAt(0).toUpperCase() + entrega.forma_pagamento.slice(1)
                : 'Não informada'}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {['pix', 'dinheiro', 'cartao', 'misto'].map((forma) => (
                <label key={forma} className="flex items-center">
                  <input
                    type="radio"
                    name="forma_pagamento"
                    value={forma}
                    checked={entrega.forma_pagamento === forma}
                    onChange={() => handleFormaPagamentoChange(forma as 'pix' | 'dinheiro' | 'cartao' | 'misto')}
                    className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    required
                  />
                  <span className="text-sm">
                    {forma.charAt(0).toUpperCase() + forma.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Campo de Valor */}
        <div className="mb-6">
          <label htmlFor="valor_entrega" className="block text-sm font-medium text-gray-700 mb-1">
            {deliveryValueLabel}
          </label>
          <input
            type="number"
            id="valor_entrega"
            name="valor_entrega"
            value={entrega.valor_entrega}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className={`w-full p-2 border rounded-md ${entrega.bairro ? 'bg-gray-100' : ''}`}
            readOnly={!!entrega.bairro}
            required
          />
          {entrega.bairro && (
            <p className="text-xs text-gray-500 mt-1">
              Taxa bloqueada após seleção do bairro
            </p>
          )}
        </div>

        {/* Botão de Enviar */}
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

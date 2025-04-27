
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import { Comanda, BairroTaxa } from '../types/database';
import { Entrega } from '../types';

export function useDeliveryForm(onDeliveryAdded: () => void) {
  const [loading, setLoading] = useState(false);
  const [motoboys, setMotoboys] = useState<any[]>([]);
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
      bairro: comanda.bairro || prev.bairro,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      pago: checked,
    }));
  };

  const handleFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    setEntrega((prev) => ({
      ...prev,
      forma_pagamento: forma,
    }));
  };

  return {
    loading,
    motoboys,
    bairros,
    comandaId,
    comandaSearchResults,
    showComandaSearch,
    entrega,
    setEntrega,
    searchComanda,
    selectComanda,
    clearComanda,
    handleInputChange,
    handleCheckboxChange,
    handleFormaPagamentoChange,
    setComandaId,
    setBairros,
    setMotoboys,
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Comanda } from '../types/database';
import { imprimirComanda } from '../utils/printService';
import { toast } from 'sonner';

export const useComandas = () => {
  const [comandasAnteriores, setComandasAnteriores] = useState<Comanda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [expandedComandas, setExpandedComandas] = useState<{ [key: string]: boolean }>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarComandas();
  }, []);

  const carregarComandas = async () => {
    try {
      setCarregando(true);
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('Usuário não está autenticado');
        setCarregando(false);
        setComandasAnteriores([]);
        return;
      }

      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao carregar comandas do Supabase:', error);
        throw error;
      }

      console.log('Comandas carregadas:', data);
      
      // Converter o campo produtos de JSONB para objeto JavaScript
      const comandasFormatadas = data?.map(comanda => ({
        ...comanda,
        produtos: Array.isArray(comanda.produtos) ? comanda.produtos : JSON.parse(comanda.produtos as any)
      })) || [];
      
      setComandasAnteriores(comandasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar comandas:', error);
      toast.error('Erro ao carregar comandas anteriores. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const reimprimirComanda = (comandaAntiga: Comanda) => {
    imprimirComanda(comandaAntiga);
    toast.success('Comanda enviada para impressão');
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
        throw error;
      }

      await carregarComandas();
      setExpandedComandas(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[id];
        return newExpanded;
      });
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir comanda:', error);
      toast.error('Erro ao excluir o pedido. Tente novamente.');
    }
  };

  const toggleExpandComanda = (id: string) => {
    setExpandedComandas(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const calcularTotaisPorFormaPagamento = () => {
    const totais = {
      pix: 0,
      dinheiro: 0,
      cartao: 0,
      geral: 0,
    };

    comandasAnteriores.forEach(comanda => {
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

  const totais = calcularTotaisPorFormaPagamento();

  return {
    comandasAnteriores,
    carregando,
    expandedComandas,
    salvando,
    setSalvando,
    reimprimirComanda,
    excluirComanda,
    toggleExpandComanda,
    carregarComandas,
    totais
  };
};


import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Comanda } from '../types/database';

export const useComandas = () => {
  const [comandasAnteriores, setComandasAnteriores] = useState<Comanda[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [expandedComandas, setExpandedComandas] = useState<{ [key: string]: boolean }>({});
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [comandaSelecionada, setComandaSelecionada] = useState<Comanda | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregarComandas = async () => {
    try {
      setCarregando(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Usuário não está autenticado');
        setComandasAnteriores([]);
        return;
      }

      const { data, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const comandasFormatadas = data?.map(comanda => ({
        ...comanda,
        produtos: Array.isArray(comanda.produtos) ? comanda.produtos : JSON.parse(comanda.produtos as string),
      })) || [];
      setComandasAnteriores(comandasFormatadas);
    } catch (error) {
      toast.error('Erro ao carregar comandas anteriores.');
    } finally {
      setCarregando(false);
    }
  };

  const toggleExpandComanda = (id: string) => {
    setExpandedComandas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const reimprimirComanda = (comanda: Comanda) => {
    import('../utils/printService').then(module => {
      module.imprimirComanda(comanda);
      toast.success('Comanda enviada para impressão');
    }).catch(() => toast.error('Erro ao reimprimir comanda'));
  };

  const excluirComanda = async (id: string | undefined) => {
    if (!id || !confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      const { error } = await supabase.from('comandas').delete().eq('id', id);
      if (error) throw error;
      await carregarComandas();
      setExpandedComandas(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[id];
        return newExpanded;
      });
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir o pedido.');
    }
  };

  const confirmarPagamento = async () => {
    if (!comandaSelecionada || !comandaSelecionada.id) return;
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comandaSelecionada.pago })
        .eq('id', comandaSelecionada.id);
      if (error) throw error;
      await carregarComandas();
      setShowPaymentConfirmation(false);
      toast.success(`Pedido marcado como ${!comandaSelecionada.pago ? 'PAGO' : 'NÃO PAGO'}!`);
    } catch (error) {
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  const calcularTotais = () => {
    const totais = { pix: 0, dinheiro: 0, cartao: 0, geral: 0, confirmados: 0, naoConfirmados: 0, misto: 0 };
    comandasAnteriores.forEach(comanda => {
      if (comanda.pago) totais.confirmados += comanda.total;
      else totais.naoConfirmados += comanda.total;
      totais.geral += comanda.total;
      if (comanda.forma_pagamento === 'pix') totais.pix += comanda.total;
      else if (comanda.forma_pagamento === 'dinheiro') totais.dinheiro += comanda.total;
      else if (comanda.forma_pagamento === 'cartao') totais.cartao += comanda.total;
      else if (comanda.forma_pagamento === 'misto') totais.misto += comanda.total;
    });
    return totais;
  };

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
    totais: calcularTotais(),
    confirmarPagamento,
    comandaSelecionada,
    setComandaSelecionada,
    showPaymentConfirmation,
    setShowPaymentConfirmation,
  };
};

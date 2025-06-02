
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { imprimirComanda } from '@/utils/printService';
import type { Comanda } from '@/types';

export function useOrderActions() {
  const [loading, setLoading] = useState(false);

  const togglePayment = async (comanda: Comanda) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('comandas')
        .update({ pago: !comanda.pago })
        .eq('id', comanda.id);

      if (error) throw new Error(`Erro ao atualizar pagamento: ${error.message}`);
      
      toast.success(`Pagamento ${!comanda.pago ? 'confirmado' : 'desmarcado'}!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reprintOrder = async (comanda: Comanda) => {
    try {
      setLoading(true);
      const produtos = comanda.produtos || [];
      const subtotal = produtos.reduce((sum, p) => sum + (p.valor || 0) * (p.quantidade || 0), 0);
      const total = subtotal + (comanda.taxaentrega || comanda.taxa_entrega || 0);

      let paymentMethod: "" | "pix" | "dinheiro" | "cartao" | "misto" = "";
      if (comanda.forma_pagamento && ["", "pix", "dinheiro", "cartao", "misto"].includes(comanda.forma_pagamento)) {
        paymentMethod = comanda.forma_pagamento as "" | "pix" | "dinheiro" | "cartao" | "misto";
      }

      const formattedComanda: Comanda = {
        ...comanda,
        id: comanda.id || crypto.randomUUID(),
        data: comanda.data || new Date().toISOString(),
        user_id: comanda.user_id || '',
        produtos: produtos.map(p => ({
          nome: p.nome || 'Produto desconhecido',
          quantidade: p.quantidade || 1,
          valor: p.valor || p.preco || 0,
        })),
        total: total,
        forma_pagamento: paymentMethod,
        pago: comanda.pago || false,
        troco: comanda.troco || 0,
        quantiapaga: comanda.quantiapaga || 0,
        valor_cartao: comanda.valor_cartao || 0,
        valor_dinheiro: comanda.valor_dinheiro || 0,
        valor_pix: comanda.valor_pix || 0,
        bairro: comanda.bairro || 'Não especificado',
        endereco: comanda.endereco || 'Não especificado',
        taxaentrega: comanda.taxaentrega || comanda.taxa_entrega || 0,
      };

      await imprimirComanda(formattedComanda);
      toast.success('Comanda enviada para impressão');
    } catch (error: unknown) {
      console.error('Erro ao reimprimir comanda:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao reimprimir comanda: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('comandas')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Erro ao excluir pedido: ${error.message}`);
      
      toast.success('Pedido excluído com sucesso!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveOrderEdit = async (id: string, updatedComanda: Partial<Comanda>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('comandas')
        .update(updatedComanda)
        .eq('id', id);

      if (error) throw new Error(`Erro ao salvar alterações: ${error.message}`);
      
      toast.success('Comanda atualizada com sucesso!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    togglePayment,
    reprintOrder,
    deleteOrder,
    saveOrderEdit,
    loading
  };
}

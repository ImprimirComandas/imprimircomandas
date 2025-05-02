
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Comanda } from '../types/database';

export const useSalvarComanda = (
  comanda: Comanda,
  totalComTaxa: number,
  needsTroco: boolean | null,
  quantiapagaInput: number | null,
  valorCartaoInput: number | null,
  valorDinheiroInput: number | null,
  valorPixInput: number | null,
  onResetComanda: (bairro: string, taxa: number) => void,
  onResetPagamento: () => void,
  carregarComandas: () => Promise<void>
) => {
  const [salvando, setSalvando] = useState(false);

  const validarComanda = () => {
    if (comanda.produtos.length === 0) {
      toast.error('Adicione pelo menos um produto.');
      return false;
    }
    if (!comanda.forma_pagamento) {
      toast.error('Selecione a forma de pagamento.');
      return false;
    }
    if (!comanda.endereco || !comanda.bairro) {
      toast.error('Preencha o endereço e o bairro.');
      return false;
    }
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco === null) {
      return false;
    }
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco && (quantiapagaInput === null || quantiapagaInput <= totalComTaxa)) {
      toast.error('Informe uma quantia válida para o troco (maior que o total).');
      return false;
    }
    if (comanda.forma_pagamento === 'misto') {
      const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
      if (Math.abs(totalValores - totalComTaxa) > 0.01) {
        return false;
      }
    }
    return true;
  };

  const salvarComanda = async () => {
    if (!validarComanda()) return;

    setSalvando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');

      const subtotal = comanda.produtos.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);
      
      const novaComanda = {
        user_id: session.user.id,
        produtos: comanda.produtos,
        total: subtotal + comanda.taxaentrega,
        forma_pagamento: comanda.forma_pagamento,
        data: new Date().toISOString(),
        endereco: comanda.endereco,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega,
        pago: comanda.pago,
        quantiapaga: needsTroco ? quantiapagaInput || 0 : totalComTaxa,
        troco: needsTroco && quantiapagaInput ? quantiapagaInput - totalComTaxa : 0,
        valor_cartao: valorCartaoInput || 0,
        valor_dinheiro: valorDinheiroInput || 0,
        valor_pix: valorPixInput || 0,
      };

      const { data, error } = await supabase.from('comandas').insert([novaComanda]).select().single();
      if (error) throw error;

      await import('../utils/printService').then(module => {
        module.imprimirComanda({ ...novaComanda, id: data.id });
        toast.success('Comanda salva e enviada para impressão!');
      }).catch(() => {
        toast.error('Comanda salva, mas erro ao imprimir.');
      });

      onResetComanda(comanda.bairro, comanda.taxaentrega);
      onResetPagamento();
      await carregarComandas();
    } catch (error: any) {
      console.error('Erro ao salvar comanda:', error);
      toast.error(`Erro ao salvar comanda: ${error.message || 'Desconhecido'}`);
    } finally {
      setSalvando(false);
    }
  };

  return {
    salvando,
    setSalvando,
    salvarComanda
  };
};

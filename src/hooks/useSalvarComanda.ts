
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
    console.log('Validating comanda before save:', comanda);
    console.log('Payment method:', comanda.forma_pagamento);
    console.log('Is paid:', comanda.pago);
    
    if (comanda.produtos.length === 0) {
      toast.error('Adicione pelo menos um produto.');
      return false;
    }
    
    // Corrected validation for payment method
    if (!comanda.forma_pagamento) {
      toast.error('Selecione a forma de pagamento.');
      return false;
    }
    
    if (!comanda.endereco || !comanda.bairro) {
      toast.error('Preencha o endereço e o bairro.');
      return false;
    }
    
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco === null) {
      toast.error('Confirme se precisa de troco.');
      return false;
    }
    
    if (comanda.forma_pagamento === 'dinheiro' && needsTroco && (quantiapagaInput === null || quantiapagaInput <= 0)) {
      toast.error('Informe uma quantia válida para o troco (maior que zero).');
      return false;
    }
    
    if (comanda.forma_pagamento === 'misto') {
      const totalValores = (valorCartaoInput || 0) + (valorDinheiroInput || 0) + (valorPixInput || 0);
      if (totalValores < totalComTaxa) {
        toast.error('O valor total do pagamento misto deve ser pelo menos igual ao valor do pedido.');
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
      
      // Calcula o troco para pagamentos em dinheiro ou mistos com excedente em dinheiro
      let trocoValue = 0;
      let quantiaPaga = totalComTaxa;
      
      if (comanda.forma_pagamento === 'dinheiro' && needsTroco && quantiapagaInput) {
        trocoValue = quantiapagaInput - totalComTaxa;
        quantiaPaga = quantiapagaInput;
      } else if (comanda.forma_pagamento === 'misto' && valorDinheiroInput) {
        // Para pagamentos mistos, calcula o valor necessário em dinheiro
        const valorOutrasFormas = (valorCartaoInput || 0) + (valorPixInput || 0);
        const valorNecessarioEmDinheiro = Math.max(0, totalComTaxa - valorOutrasFormas);
        
        // Se o valor em dinheiro for maior que o necessário, calcula o troco
        if (valorDinheiroInput > valorNecessarioEmDinheiro) {
          trocoValue = valorDinheiroInput - valorNecessarioEmDinheiro;
          quantiaPaga = totalComTaxa + trocoValue; // Quantia paga é o total + troco
        }
      }
      
      console.log('Saving comanda with:', {
        forma_pagamento: comanda.forma_pagamento,
        pago: comanda.pago
      });

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
        quantiapaga: quantiaPaga,
        troco: trocoValue,
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

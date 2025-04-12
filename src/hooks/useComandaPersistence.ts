
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Comanda } from '../types/database';
import { imprimirComanda } from '../utils/printService';
import { toast } from 'sonner';

export const useComandaPersistence = () => {
  const salvarComanda = async (
    comanda: Comanda,
    totalComTaxa: number,
    valorCartaoInput: string,
    valorDinheiroInput: string,
    valorPixInput: string,
    needsTroco: boolean | null,
    validarComanda: () => boolean,
    carregarComandas: () => Promise<void>,
    setSalvando: (value: boolean) => void,
    resetComanda: () => void
  ) => {
    if (!validarComanda()) return;

    setSalvando(true);

    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado para salvar comandas.');
        setSalvando(false);
        return;
      }

      const comandaData: Omit<Comanda, 'id' | 'created_at'> = {
        user_id: session.user.id,
        produtos: comanda.produtos,
        total: totalComTaxa,
        forma_pagamento: comanda.forma_pagamento,
        data: comanda.data,
        endereco: comanda.endereco,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega,
        pago: comanda.pago,
      };

      if (comanda.forma_pagamento === 'misto') {
        comandaData.valor_cartao = parseFloat(valorCartaoInput) || 0;
        comandaData.valor_dinheiro = parseFloat(valorDinheiroInput) || 0;
        comandaData.valor_pix = parseFloat(valorPixInput) || 0;
        
        if (needsTroco && comanda.quantiapaga && comanda.troco) {
          comandaData.quantiapaga = comanda.quantiapaga;
          comandaData.troco = comanda.troco;
        }
      } else if (comanda.forma_pagamento === 'dinheiro' && needsTroco && comanda.quantiapaga && comanda.troco) {
        comandaData.quantiapaga = comanda.quantiapaga;
        comandaData.troco = comanda.troco;
      } else {
        comandaData.quantiapaga = undefined;
        comandaData.troco = undefined;
      }

      console.log('Dados a serem salvos no Supabase:', comandaData);

      const { data, error } = await supabase
        .from('comandas')
        .insert([comandaData])
        .select();

      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        throw new Error(error.message || 'Erro ao salvar no banco de dados');
      }

      console.log('Comanda salva com sucesso:', data);
      toast.success('Comanda salva com sucesso!');
      await carregarComandas();

      const comandaParaImprimir = { ...comandaData, id: data[0].id };
      imprimirComanda(comandaParaImprimir);

      resetComanda();
    } catch (error: unknown) {
      console.error('Erro ao salvar comanda:', error);
      if (error instanceof Error) {
        toast.error(`Erro ao salvar comanda: ${error.message || 'Tente novamente.'}`);
      } else {
        toast.error('Erro ao salvar comanda: Tente novamente.');
      }
    } finally {
      setSalvando(false);
    }
  };

  return {
    salvarComanda
  };
};

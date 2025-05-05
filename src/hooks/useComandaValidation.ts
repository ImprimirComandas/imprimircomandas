
import { toast } from 'sonner';
import type { Comanda } from '../types/database';

export const useComandaValidation = () => {
  const validateComanda = (comanda: Comanda, isShopOpen: boolean): boolean => {
    if (!isShopOpen) {
      toast.error('A loja está fechada. Não é possível cadastrar novos pedidos.');
      return false;
    }
    if (comanda.produtos.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return false;
    }
    if (!comanda.bairro) {
      toast.error('Selecione um bairro');
      return false;
    }
    if (!comanda.endereco) {
      toast.error('Informe o endereço');
      return false;
    }
    // Using a more type-safe way to check for empty forma_pagamento
    if (!comanda.forma_pagamento) {
      toast.error('Selecione uma forma de pagamento');
      return false;
    }
    return true;
  };

  return { validateComanda };
};

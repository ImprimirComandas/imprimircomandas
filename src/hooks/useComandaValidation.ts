
import { toast } from 'sonner';
import type { Comanda } from '../types/database';

export const useComandaValidation = () => {
  const validateComanda = (comanda: Comanda, isShopOpen: boolean): boolean => {
    console.log('Validating comanda:', comanda);
    console.log('Payment method:', comanda.forma_pagamento);
    
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
    
    // Check if payment method is not selected - Fixed type comparison issue
    if (comanda.forma_pagamento === '') {
      console.log('Forma de pagamento is empty');
      toast.error('Selecione uma forma de pagamento');
      return false;
    }
    
    console.log('Validation passed successfully');
    return true;
  };

  return { validateComanda };
};

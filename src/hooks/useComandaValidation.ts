
import { toast } from 'sonner';

export const useComandaValidation = () => {
  const validarComanda = (
    comanda: any, 
    needsTroco: boolean | null, 
    valorCartaoInput: string,
    valorDinheiroInput: string,
    valorPixInput: string,
    totalComTaxa: number,
    setShowTrocoModal: (show: boolean) => void
  ) => {
    if (!comanda.endereco) {
      toast.error('Por favor, preencha o endereço de entrega');
      return false;
    }
    if (!comanda.bairro) {
      toast.error('Por favor, selecione o bairro');
      return false;
    }
    if (comanda.produtos.length === 0) {
      toast.error('Por favor, adicione pelo menos um produto');
      return false;
    }
    if (!comanda.forma_pagamento) {
      toast.error('Por favor, selecione a forma de pagamento');
      return false;
    }
    
    if (comanda.forma_pagamento === 'misto') {
      const valorCartao = parseFloat(valorCartaoInput) || 0;
      const valorDinheiro = parseFloat(valorDinheiroInput) || 0;
      const valorPix = parseFloat(valorPixInput) || 0;
      const totalPagamento = valorCartao + valorDinheiro + valorPix;
      
      if (Math.abs(totalPagamento - totalComTaxa) > 0.01) {
        toast.error(`O total dos pagamentos (${totalPagamento.toFixed(2)}) deve ser igual ao valor total (${totalComTaxa.toFixed(2)})`);
        return false;
      }
      
      if (valorDinheiro > 0 && needsTroco === null) {
        setShowTrocoModal(true);
        return false;
      }
      
      if (needsTroco && (!comanda.quantiapaga || comanda.quantiapaga <= valorDinheiro)) {
        toast.error('Por favor, informe uma quantia válida para calcular o troco (deve ser maior que o valor em dinheiro).');
        return false;
      }
    } else if (comanda.forma_pagamento === 'dinheiro') {
      if (needsTroco === null) {
        setShowTrocoModal(true);
        return false;
      }
      if (needsTroco && (!comanda.quantiapaga || comanda.quantiapaga <= totalComTaxa)) {
        toast.error('Por favor, informe uma quantia válida para calcular o troco (deve ser maior que o total com a taxa).');
        return false;
      }
    }
    
    return true;
  };

  return {
    validarComanda
  };
};

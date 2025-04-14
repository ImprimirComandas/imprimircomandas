
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { Comanda, Produto } from '../types/database';
import { useProdutos } from './useProdutos';
import { usePagamento } from './usePagamento';
import bairroTaxas from '../constants/bairroTaxas';

export const useComandaForm = (carregarComandas: () => Promise<void>, setSalvando: (value: boolean) => void) => {
  // Initialize the comanda state
  const [comanda, setComanda] = useState<Comanda>({
    produtos: [],
    total: 0,
    forma_pagamento: '',
    data: new Date().toISOString(),
    endereco: '',
    bairro: 'Jardim Paraíso',
    taxaentrega: 6,
    pago: false,
    quantiapaga: 0,
    troco: 0,
    valor_cartao: 0,
    valor_dinheiro: 0,
    valor_pix: 0,
  });

  // Calculate total with delivery fee
  const totalComTaxa = comanda.total + comanda.taxaentrega;

  // Use the products hook for managing products
  const {
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    pesquisaProduto,
    setPesquisaProduto,
    salvarProduto,
    editarProduto,
    startEditingProduct,
  } = useProdutos();

  // Use the payment hook for managing payment options
  const pagamento = usePagamento(totalComTaxa);

  // Handle field changes
  const onChange = (field: string, value: any) => {
    if (field === 'pesquisaProduto') {
      setPesquisaProduto(value);
    } else if (field === 'endereco') {
      setComanda(prev => ({ ...prev, endereco: value }));
    } else if (field === 'pago') {
      setComanda(prev => ({ ...prev, pago: value }));
    } else {
      // Handle payment-related fields
      pagamento.onPagamentoChange(field, value);
    }
  };

  // Handle bairro selection and update delivery fee
  const onBairroChange = (bairro: string) => {
    const taxa = bairroTaxas[bairro as keyof typeof bairroTaxas] || 0;
    setComanda(prev => ({ ...prev, bairro, taxaentrega: taxa }));
  };

  // Handle payment method selection
  const onFormaPagamentoChange = (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => {
    setComanda(prev => ({ ...prev, forma_pagamento: forma }));
    pagamento.onFormaPagamentoChange(forma);
  };

  // Add selected product to comanda
  const selecionarProdutoCadastrado = (produto: { id: string; nome: string; valor: number }) => {
    const novoProduto: Produto = { nome: produto.nome, valor: produto.valor, quantidade: 1 };
    setComanda(prev => ({
      ...prev,
      produtos: [...prev.produtos, novoProduto],
      total: prev.total + produto.valor,
    }));
    setPesquisaProduto('');
  };

  // Remove product from comanda
  const removerProduto = (index: number) => {
    const produtoRemovido = comanda.produtos[index];
    setComanda(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index),
      total: prev.total - produtoRemovido.valor * produtoRemovido.quantidade,
    }));
  };

  // Update product quantity
  const atualizarQuantidadeProduto = (index: number, quantidade: number) => {
    if (quantidade < 1) {
      toast.error('A quantidade deve ser pelo menos 1.');
      return;
    }
    setComanda(prev => {
      const novosProdutos = [...prev.produtos];
      const produtoAntigo = novosProdutos[index];
      const diferencaQuantidade = quantidade - produtoAntigo.quantidade;
      novosProdutos[index] = { ...produtoAntigo, quantidade };
      return {
        ...prev,
        produtos: novosProdutos,
        total: prev.total + diferencaQuantidade * produtoAntigo.valor,
      };
    });
  };

  // Save comanda to database
  const salvarComanda = async () => {
    // Validate comanda fields
    if (comanda.produtos.length === 0) {
      toast.error('Adicione pelo menos um produto.');
      return;
    }
    if (!comanda.forma_pagamento) {
      toast.error('Selecione a forma de pagamento.');
      return;
    }
    if (!comanda.endereco || !comanda.bairro) {
      toast.error('Preencha o endereço e o bairro.');
      return;
    }

    // Handle payment validation
    if (comanda.forma_pagamento === 'dinheiro' && pagamento.needsTroco === null) {
      pagamento.setShowTrocoModal(true);
      return;
    }

    if (comanda.forma_pagamento === 'dinheiro' && pagamento.needsTroco 
        && (pagamento.quantiapagaInput === null || pagamento.quantiapagaInput <= totalComTaxa)) {
      toast.error('Informe uma quantia válida para o troco (maior que o total).');
      return;
    }

    if (comanda.forma_pagamento === 'misto') {
      const totalValores = (pagamento.valorCartaoInput || 0) + 
                          (pagamento.valorDinheiroInput || 0) + 
                          (pagamento.valorPixInput || 0);
      if (Math.abs(totalValores - totalComTaxa) > 0.01) {
        pagamento.setShowPagamentoMistoModal(true);
        return;
      }
    }

    setSalvando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autorizado');

      const novaComanda = {
        user_id: session.user.id,
        produtos: comanda.produtos,
        total: totalComTaxa,
        forma_pagamento: comanda.forma_pagamento,
        data: new Date().toISOString(),
        endereco: comanda.endereco,
        bairro: comanda.bairro,
        taxaentrega: comanda.taxaentrega,
        pago: comanda.pago,
        quantiapaga: pagamento.needsTroco ? pagamento.quantiapagaInput || 0 : totalComTaxa,
        troco: pagamento.needsTroco && pagamento.quantiapagaInput ? pagamento.quantiapagaInput - totalComTaxa : 0,
        valor_cartao: pagamento.valorCartaoInput || 0,
        valor_dinheiro: pagamento.valorDinheiroInput || 0,
        valor_pix: pagamento.valorPixInput || 0,
      };

      const { data, error } = await supabase.from('comandas').insert([novaComanda]).select().single();
      if (error) throw error;

      // Print the comanda
      await import('../utils/printService').then(module => {
        module.imprimirComanda({ ...novaComanda, id: data.id });
        toast.success('Comanda salva e enviada para impressão!');
      }).catch(() => {
        toast.error('Comanda salva, mas erro ao imprimir.');
      });

      // Reset form
      setComanda({
        produtos: [],
        total: 0,
        forma_pagamento: '',
        data: new Date().toISOString(),
        endereco: '',
        bairro: 'Jardim Paraíso',
        taxaentrega: 6,
        pago: false,
        quantiapaga: 0,
        troco: 0,
        valor_cartao: 0,
        valor_dinheiro: 0,
        valor_pix: 0,
      });
      pagamento.resetPagamento();
      setPesquisaProduto('');
      await carregarComandas();
    } catch (error: any) {
      console.error('Erro ao salvar comanda:', error);
      toast.error(`Erro ao salvar comanda: ${error.message || 'Desconhecido'}`);
    } finally {
      setSalvando(false);
    }
  };

  return {
    comanda,
    pesquisaProduto,
    produtosFiltrados,
    editingProduct,
    setEditingProduct,
    totalComTaxa,
    onBairroChange,
    salvarProduto,
    editarProduto,
    removerProduto,
    atualizarQuantidadeProduto,
    onFormaPagamentoChange,
    onChange,
    salvarComanda,
    selecionarProdutoCadastrado,
    startEditingProduct,
    ...pagamento
  };
};

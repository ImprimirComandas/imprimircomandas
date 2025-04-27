import { useState } from 'react';
import type { Comanda, Produto } from '../types/database';

export const useComandaState = (initialBairro: string = '', initialTaxa: number = 0) => {
  const [comanda, setComanda] = useState<Comanda>({
    produtos: [],
    total: 0,
    forma_pagamento: '',
    data: new Date().toISOString(),
    endereco: '',
    bairro: initialBairro,
    taxaentrega: initialTaxa,
    pago: false,
    quantiapaga: 0,
    troco: 0,
    valor_cartao: 0,
    valor_dinheiro: 0,
    valor_pix: 0,
  });

  const subtotal = comanda.produtos.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);
  const totalComTaxa = subtotal + comanda.taxaentrega;

  const updateComandaField = (field: string, value: any) => {
    setComanda(prev => ({ ...prev, [field]: value }));
  };

  const onBairroChange = (bairro: string, taxas: Record<string, number>) => {
    const taxa = taxas[bairro] || 0;
    setComanda(prev => ({ ...prev, bairro, taxaentrega: taxa }));
  };

  const selecionarProdutoCadastrado = (produto: { id: string; nome: string; valor: number }) => {
    const novoProduto: Produto = { nome: produto.nome, valor: produto.valor, quantidade: 1 };
    setComanda(prev => {
      const novoTotal = prev.produtos.reduce(
        (sum, item) => sum + item.valor * item.quantidade, 
        0
      ) + produto.valor;
      
      return {
        ...prev,
        produtos: [...prev.produtos, novoProduto],
        total: novoTotal,
      };
    });
  };

  const removerProduto = (index: number) => {
    const produtoRemovido = comanda.produtos[index];
    setComanda(prev => {
      const novoTotal = prev.total - produtoRemovido.valor * produtoRemovido.quantidade;
      return {
        ...prev,
        produtos: prev.produtos.filter((_, i) => i !== index),
        total: novoTotal,
      };
    });
  };

  const atualizarQuantidadeProduto = (index: number, quantidade: number) => {
    if (quantidade < 1) {
      return;
    }
    setComanda(prev => {
      const novosProdutos = [...prev.produtos];
      const produtoAntigo = novosProdutos[index];
      const diferencaQuantidade = quantidade - produtoAntigo.quantidade;
      novosProdutos[index] = { ...produtoAntigo, quantidade };
      
      const novoTotal = prev.total + diferencaQuantidade * produtoAntigo.valor;
      
      return {
        ...prev,
        produtos: novosProdutos,
        total: novoTotal,
      };
    });
  };

  const resetComanda = (bairro: string = '', taxa: number = 0) => {
    setComanda({
      produtos: [],
      total: 0,
      forma_pagamento: '',
      data: new Date().toISOString(),
      endereco: '',
      bairro: bairro,
      taxaentrega: taxa,
      pago: false,
      quantiapaga: 0,
      troco: 0,
      valor_cartao: 0,
      valor_dinheiro: 0,
      valor_pix: 0,
    });
  };

  return {
    comanda,
    subtotal,
    totalComTaxa,
    updateComandaField,
    onBairroChange,
    selecionarProdutoCadastrado,
    removerProduto,
    atualizarQuantidadeProduto,
    resetComanda,
  };
};

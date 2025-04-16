
import { useState } from 'react';
import type { Produto, Comanda } from '../types/database';

export function useComandaCalculation() {
  const [comanda, setComanda] = useState<Comanda>({
    produtos: [],
    total: 0,
    forma_pagamento: '',
    data: new Date().toISOString(),
    endereco: '',
    bairro: 'Jardim Paraíso',
    taxaentrega: 6,
    pago: false,
  });

  // Calculate the total with delivery tax
  const totalComTaxa = comanda.total + comanda.taxaentrega;

  // Add a product to the order
  const adicionarProduto = (produto: Produto) => {
    setComanda(prev => {
      const novoTotal = prev.total + (produto.valor * produto.quantidade);
      return {
        ...prev,
        produtos: [...prev.produtos, produto],
        total: novoTotal,
      };
    });
  };

  // Remove a product from the order
  const removerProduto = (index: number) => {
    const produtoRemovido = comanda.produtos[index];
    if (!produtoRemovido) return;
    
    const valorProduto = produtoRemovido.valor * produtoRemovido.quantidade;
    
    setComanda(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index),
      total: Math.max(0, prev.total - valorProduto),
    }));
  };

  // Update the quantity of a product
  const atualizarQuantidadeProduto = (index: number, quantidade: number) => {
    if (quantidade < 1) return;
    
    setComanda(prev => {
      const novosProdutos = [...prev.produtos];
      const produtoAntigo = novosProdutos[index];
      
      if (!produtoAntigo) return prev;
      
      const valorAntigo = produtoAntigo.valor * produtoAntigo.quantidade;
      const valorNovo = produtoAntigo.valor * quantidade;
      const diferencaValor = valorNovo - valorAntigo;
      
      novosProdutos[index] = { ...produtoAntigo, quantidade };
      
      return {
        ...prev,
        produtos: novosProdutos,
        total: prev.total + diferencaValor,
      };
    });
  };

  // Update the delivery neighborhood and tax
  const atualizarBairroTaxa = (bairro: string, taxa: number) => {
    setComanda(prev => ({
      ...prev,
      bairro,
      taxaentrega: taxa,
    }));
  };

  // Reset the order
  const resetarComanda = (bairro?: string, taxaEntrega?: number) => {
    setComanda({
      produtos: [],
      total: 0,
      forma_pagamento: '',
      data: new Date().toISOString(),
      endereco: '',
      bairro: bairro || comanda.bairro,
      taxaentrega: taxaEntrega !== undefined ? taxaEntrega : comanda.taxaentrega,
      pago: false,
    });
  };

  return {
    comanda,
    setComanda,
    totalComTaxa,
    adicionarProduto,
    removerProduto,
    atualizarQuantidadeProduto,
    atualizarBairroTaxa,
    resetarComanda,
  };
}

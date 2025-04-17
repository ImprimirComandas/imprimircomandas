import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Save, Trash2, Search, Edit, Plus, Minus, AlertTriangle } from 'lucide-react';
import formatCurrency from '../utils/formatCurrency';
import { useShopIsOpen } from '../hooks/useShopIsOpen';
import { toast } from 'sonner';
import type { Comanda, Produto } from '../types/database';

interface ComandaFormProps {
  comanda: Comanda;
  pesquisaProduto: string;
  produtosFiltrados: { id: string; nome: string; valor: number; numero?: number }[];
  salvando: boolean;
  totalComTaxa: number;
  bairrosDisponiveis: string[];
  onRemoveProduto: (index: number) => void;
  onUpdateQuantidade: (index: number, quantidade: number) => void;
  onSaveComanda: () => void;
  onChange: (field: string, value: string | number | boolean) => void;
  onBairroChange: (bairro: string) => void;
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
  selecionarProdutoCadastrado: (produto: { id: string; nome: string; valor: number }) => void;
  startEditingProduct: (produto: { id: string; nome: string; valor: number }) => void;
}

export default function ComandaForm({
  comanda,
  pesquisaProduto,
  produtosFiltrados,
  salvando,
  totalComTaxa,
  bairrosDisponiveis,
  onRemoveProduto,
  onUpdateQuantidade,
  onSaveComanda,
  onChange,
  onBairroChange,
  onFormaPagamentoChange,
  selecionarProdutoCadastrado,
  startEditingProduct,
}: ComandaFormProps) {
  const { isShopOpen } = useShopIsOpen();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate subtotal
  const subtotal = comanda.produtos.reduce((sum, produto) => sum + (produto.valor * produto.quantidade), 0);

  const handleSaveComanda = () => {
    if (!isShopOpen) {
      toast.error('A loja está fechada. Não é possível cadastrar novos pedidos.');
      return;
    }
    if (comanda.produtos.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }
    if (!comanda.bairro) {
      toast.error('Selecione um bairro');
      return;
    }
    if (!comanda.endereco) {
      toast.error('Informe o endereço');
      return;
    }
    if (!comanda.forma_pagamento) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }
    onSaveComanda();
  };

  // Handle product selection
  const handleSelectProduct = (produto: { id: string; nome: string; valor: number }) => {
    selecionarProdutoCadastrado(produto);
    onChange('pesquisaProduto', ''); // Clear search input
    if (searchInputRef.current) {
      searchInputRef.current.blur(); // Remove focus from input
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-4 md:p-6"
    >
      {/* Busca de Produtos */}
      <div className="mb-4">
        <label htmlFor="pesquisaProduto" className="block text-sm font-medium text-gray-700">
          Buscar Produto (nome ou número)
        </label>
        <div className="relative">
          <input
            id="pesquisaProduto"
            type="text"
            value={pesquisaProduto}
            onChange={(e) => onChange('pesquisaProduto', e.target.value)}
            placeholder="Digite para buscar produtos cadastrados"
            className="w-full p-2 pl-8 border rounded text-sm"
            ref={searchInputRef}
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          {pesquisaProduto && produtosFiltrados.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
            >
              {produtosFiltrados.map((produto) => (
                <div
                  key={produto.id}
                  className="p-2 hover:bg-gray-100 flex justify-between items-center"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleSelectProduct(produto)}
                  >
                    <div className="font-medium">
                      {produto.numero !== undefined && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2 py-0.5 rounded">
                          #{produto.numero}
                        </span>
                      )}
                      {produto.nome}
                    </div>
                    <div className="text-sm text-gray-600">R$ {produto.valor.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => startEditingProduct(produto)}
                    className="text-blue-600 hover:text-blue-900 ml-2"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
          {pesquisaProduto && produtosFiltrados.length === 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 p-2 text-center text-gray-500">
              Nenhum produto encontrado
            </div>
          )}
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="mb-6">
        <h2 className="text-base md:text-lg font-semibold mb-3">Produtos</h2>
        <div className="space-y-2">
          {comanda.produtos.map((produto: Produto, index: number) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
              <span className="flex-1">{produto.nome}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateQuantidade(index, produto.quantidade - 1)}
                  disabled={produto.quantidade <= 1}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={produto.quantidade}
                  onChange={(e) => onUpdateQuantidade(index, Number(e.target.value))}
                  className="w-16 p-1 border rounded text-sm text-center"
                  min="1"
                  placeholder="Quantidade"
                  title="Quantidade do produto"
                />
                <button
                  type="button"
                  onClick={() => onUpdateQuantidade(index, produto.quantidade + 1)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Plus size={18} />
                </button>
                <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => onRemoveProduto(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Endereço */}
      <div className="mb-4">
        <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
          Endereço de Entrega
        </label>
        <input
          id="endereco"
          type="text"
          value={comanda.endereco}
          onChange={(e) => onChange('endereco', e.target.value)}
          placeholder="Endereço de entrega"
          className="w-full p-2 border rounded text-sm"
          required
        />
      </div>

      {/* Bairro */}
      <div className="mb-4">
        <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
          Bairro
        </label>
        <select
          id="bairro"
          value={comanda.bairro}
          onChange={(e) => onBairroChange(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          required
        >
          <option value="">Selecione o bairro</option>
          {bairrosDisponiveis.map((bairro) => (
            <option key={bairro} value={bairro}>
              {bairro} (R$ {comanda.bairro === bairro ? comanda.taxaentrega.toFixed(2) : '...'})
            </option>
          ))}
        </select>
      </div>

      {/* Total, Forma de Pagamento e Status de Pagamento */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-semibold">Subtotal:</h2>
          <span className="text-lg font-bold">R$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base">Entrega:</h3>
          <span className="text-base font-bold">R$ {comanda.taxaentrega.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-4 bg-green-50 p-2 rounded">
          <h2 className="text-base font-semibold">Total:</h2>
          <span className="text-lg font-bold text-green-700">R$ {totalComTaxa.toFixed(2)}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Forma de Pagamento
            </label>
            <div className="mt-2 flex flex-wrap gap-4">
              {['pix', 'dinheiro', 'cartao', 'misto'].map((forma) => (
                <label key={forma} className="flex items-center">
                  <input
                    type="radio"
                    name="formaPagamento"
                    value={forma}
                    checked={comanda.forma_pagamento === forma}
                    onChange={() => onFormaPagamentoChange(forma as 'pix' | 'dinheiro' | 'cartao' | 'misto' | '')}
                    className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    required
                  />
                  <span className="text-sm">{forma.charAt(0).toUpperCase() + forma.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pago"
              checked={comanda.pago}
              onChange={(e) => onChange('pago', e.target.checked)}
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <label htmlFor="pago" className="text-sm font-medium text-gray-700">
              Pedido Pago
            </label>
          </div>
        </div>
      </div>

      {/* Shop Closed Warning */}
      {!isShopOpen && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Atenção</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>A loja está fechada. Não é possível cadastrar novos pedidos.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Ação */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveComanda}
          disabled={salvando || !isShopOpen}
          className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 text-sm ${
            salvando || !isShopOpen ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={18} />
          {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
        </button>
      </div>
    </motion.div>
  );
}
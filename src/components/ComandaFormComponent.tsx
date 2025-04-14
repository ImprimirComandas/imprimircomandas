import { Search, Edit, Trash2, Save } from 'lucide-react';
import type { Comanda, Produto } from '../types/database';

interface ComandaFormComponentProps {
  comanda: Comanda;
  pesquisaProduto: string;
  produtosFiltrados: { id: string; nome: string; valor: number }[];
  salvando: boolean;
  totalComTaxa: number;
  onRemoveProduto: (index: number) => void;
  onUpdateQuantidade: (index: number, quantidade: number) => void;
  onSaveComanda: () => void;
  onChange: (field: string, value: any) => void;
  onBairroChange: (bairro: string) => void;
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
  selecionarProdutoCadastrado: (produto: { id: string; nome: string; valor: number }) => void;
  startEditingProduct: (produto: { id: string; nome: string; valor: number }) => void;
}

const ComandaFormComponent = ({
  comanda,
  pesquisaProduto,
  produtosFiltrados,
  salvando,
  totalComTaxa,
  onRemoveProduto,
  onUpdateQuantidade,
  onSaveComanda,
  onChange,
  onBairroChange,
  onFormaPagamentoChange,
  selecionarProdutoCadastrado,
  startEditingProduct,
}: ComandaFormComponentProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* Busca de Produtos */}
      <div className="mb-4">
        <label htmlFor="pesquisaProduto" className="block text-sm font-medium text-gray-700">
          Buscar Produto
        </label>
        <div className="relative">
          <input
            id="pesquisaProduto"
            type="text"
            value={pesquisaProduto}
            onChange={(e) => onChange('pesquisaProduto', e.target.value)}
            placeholder="Digite para buscar produtos cadastrados"
            className="w-full p-2 pl-8 border rounded text-sm"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          {pesquisaProduto && produtosFiltrados.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              {produtosFiltrados.map((produto) => (
                <div
                  key={produto.id}
                  className="p-2 hover:bg-gray-100 flex justify-between items-center"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => selecionarProdutoCadastrado(produto)}
                  >
                    <div className="font-medium">{produto.nome}</div>
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
            </div>
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
                <input
                  type="number"
                  value={produto.quantidade}
                  onChange={(e) => onUpdateQuantidade(index, Number(e.target.value))}
                  className="w-16 p-1 border rounded text-sm"
                  min="1"
                />
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
          <option value="Jardim Paraíso">Jardim Paraíso (R$ 6,00)</option>
          <option value="Aventureiro">Aventureiro (R$ 9,00)</option>
          <option value="Jardim Sofia">Jardim Sofia (R$ 9,00)</option>
          <option value="Cubatão">Cubatão (R$ 9,00)</option>
        </select>
      </div>

      {/* Total, Forma de Pagamento e Status de Pagamento */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-semibold">Subtotal:</h2>
          <span className="text-lg font-bold">R$ {comanda.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base">Taxa de Entrega:</h3>
          <span className="text-base font-bold">R$ {comanda.taxaentrega.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base">Total com Taxa:</h2>
          <span className="text-base font-bold">R$ {totalComTaxa.toFixed(2)}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700">
              Forma de Pagamento
            </label>
            <select
              id="formaPagamento"
              value={comanda.forma_pagamento}
              onChange={(e) => onFormaPagamentoChange(e.target.value as 'pix' | 'dinheiro' | 'cartao' | 'misto' | '')}
              className="w-full p-2 border rounded text-sm"
              required
            >
              <option value="">Selecione a forma de pagamento</option>
              <option value="pix">PIX</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="misto">Pagamento Misto</option>
            </select>
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

      {/* Botão de Ação */}
      <div className="flex justify-end">
        <button
          onClick={onSaveComanda}
          disabled={salvando}
          className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 text-sm ${
            salvando ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={18} />
          {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
        </button>
      </div>
    </div>
  );
};

export default ComandaFormComponent;

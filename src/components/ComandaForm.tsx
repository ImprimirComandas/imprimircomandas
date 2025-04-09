
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import type { Comanda as ComandaType, Produto as ProdutoType } from '../types/database';

interface ComandaFormProps {
  comanda: ComandaType;
  nomeProduto: string;
  valorProduto: string;
  quantidadeProduto: string;
  salvando: boolean;
  onAddProduto: () => void;
  onRemoveProduto: (index: number) => void;
  onSaveComanda: () => void;
  onChange: (field: string, value: string | number) => void;
}

export default function ComandaForm({
  comanda,
  nomeProduto,
  valorProduto,
  quantidadeProduto,
  salvando,
  onAddProduto,
  onRemoveProduto,
  onSaveComanda,
  onChange,
}: ComandaFormProps) {
  const totalComTaxa = comanda.total + comanda.taxaentrega;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-center">Comanda de Delivery</h1>
      {/* Endereço */}
      <div className="mb-6">
        <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
          Endereço de Entrega
        </label>
        <input
          id="endereco"
          type="text"
          value={comanda.endereco}
          onChange={(e) => onChange('endereco', e.target.value)}
          placeholder="Endereço de entrega"
          className="w-full p-2 border rounded text-sm md:text-base"
          required
        />
      </div>
      {/* Produtos */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="nomeProduto" className="block text-sm font-medium text-gray-700">
            Nome do Produto
          </label>
          <input
            id="nomeProduto"
            type="text"
            value={nomeProduto}
            onChange={(e) => onChange('nomeProduto', e.target.value)}
            placeholder="Nome do Produto"
            className="w-full p-2 border rounded text-sm md:text-base"
          />
        </div>
        <div className="flex gap-2">
          <div>
            <label htmlFor="valorProduto" className="block text-sm font-medium text-gray-700">
              Valor
            </label>
            <input
              id="valorProduto"
              type="number"
              value={valorProduto}
              onChange={(e) => onChange('valorProduto', e.target.value)}
              placeholder="Valor"
              className="w-24 md:w-32 p-2 border rounded text-sm md:text-base"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="quantidadeProduto" className="block text-sm font-medium text-gray-700">
              Quantidade
            </label>
            <input
              id="quantidadeProduto"
              type="number"
              value={quantidadeProduto}
              onChange={(e) => onChange('quantidadeProduto', e.target.value)}
              placeholder="Qtd"
              className="w-16 md:w-20 p-2 border rounded text-sm md:text-base"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 invisible">Adicionar</label>
            <button
              onClick={onAddProduto}
              className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-1 md:gap-2 text-sm md:text-base"
            >
              <PlusCircle size={18} />
              <span className="hidden md:inline">Adicionar</span>
            </button>
          </div>
        </div>
      </div>
      {/* Lista de Produtos */}
      <div className="mb-6">
        <h2 className="text-base md:text-lg font-semibold mb-3">Produtos</h2>
        <div className="space-y-2">
          {comanda.produtos.map((produto: ProdutoType, index: number) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 md:p-3 rounded text-sm md:text-base">
              <span className="flex-1">{produto.nome}</span>
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-gray-600">Qtd: {produto.quantidade}</span>
                <span>R$ {(produto.valor * produto.quantidade).toFixed(2)}</span>
                <button
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
      {/* Total */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base">Subtotal:</h2>
          <span className="font-bold">R$ {comanda.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base">Taxa de Entrega:</h2>
          <span className="font-bold">R$ {comanda.taxaentrega.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base">Total com Taxa:</h2>
          <span className="font-bold">R$ {totalComTaxa.toFixed(2)}</span>
        </div>
      </div>
      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <button
          onClick={onSaveComanda}
          disabled={salvando}
          className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 text-sm md:text-base ${
            salvando ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save size={18} />
          {salvando ? 'Salvando...' : 'Salvar e Imprimir'}
        </button>
      </div>
    </div>
  );
}

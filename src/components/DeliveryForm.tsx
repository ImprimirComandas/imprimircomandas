
import React from 'react';
import { Check, Search } from 'lucide-react';
import type { Comanda } from '../types/database';

interface DeliveryFormProps {
  orderCode: string;
  setOrderCode: (value: string) => void;
  selectedPlatform: string;
  setSelectedPlatform: (value: string) => void;
  selectedMotoboy: string;
  setSelectedMotoboy: (value: string) => void;
  deliveryValue: string;
  setDeliveryValue: (value: string) => void;
  matchedComanda: Comanda | null;
  loadingComandas: boolean;
  motoboys: { id: string; nome: string }[];
  pendingDeliveriesByMotoboy: {[key: string]: number};
  onSubmit: (e: React.FormEvent) => void;
}

export default function DeliveryForm({
  orderCode,
  setOrderCode,
  selectedPlatform,
  setSelectedPlatform,
  selectedMotoboy, 
  setSelectedMotoboy,
  deliveryValue,
  setDeliveryValue,
  matchedComanda,
  loadingComandas,
  motoboys,
  pendingDeliveriesByMotoboy,
  onSubmit
}: DeliveryFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 p-4 rounded-md mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código do Pedido</label>
          <div className="flex">
            <input
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-l-md"
              placeholder="Código do pedido ou últimos 8 dígitos"
            />
            <div className="bg-gray-200 text-gray-700 p-2 flex items-center justify-center rounded-r-md">
              {loadingComandas ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
              ) : (
                <Search className="h-5 w-5" />
              )}
            </div>
          </div>
          {matchedComanda && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <Check className="inline h-4 w-4 mr-1" />
                Comanda encontrada - {new Date(matchedComanda.data).toLocaleDateString()}
              </p>
              <p className="text-sm text-green-800">
                Total: R$ {matchedComanda.total.toFixed(2)} | {matchedComanda.bairro}
              </p>
              <p className="text-sm text-green-800">
                Endereço: {matchedComanda.endereco}
              </p>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma*</label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="ifood">iFood</option>
            <option value="zedelivery">Zé Delivery</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motoboy*</label>
          <select
            value={selectedMotoboy}
            onChange={(e) => setSelectedMotoboy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Selecione um motoboy</option>
            {motoboys.map((motoboy) => (
              <option key={motoboy.id} value={motoboy.id}>
                {motoboy.nome} ({pendingDeliveriesByMotoboy[motoboy.id] || 0} entregas pendentes)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Entrega</label>
          <input
            type="number"
            value={deliveryValue}
            onChange={(e) => setDeliveryValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Registrar Entrega
        </button>
      </div>
    </form>
  );
}

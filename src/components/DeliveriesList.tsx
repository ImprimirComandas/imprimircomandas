
import React from 'react';
import { Check, X } from 'lucide-react';

interface Delivery {
  id: string;
  comanda_id?: string;
  motoboy_id: string;
  origem: string;
  endereco: string;
  bairro: string;
  status?: string;
  valor_entrega: number;
  data: string;
}

interface DeliveriesListProps {
  deliveries: Delivery[];
  selectedDeliveries: string[];
  toggleDeliverySelection: (id: string) => void;
  getMotoboyName: (id: string) => string;
  formatPlatform: (platform: string) => string;
  handleUpdateDeliveryStatus: (id: string, status: string) => void;
  motoboys: { id: string; nome: string }[];
  assignSelectedDeliveriesToMotoboy: (motoboyId: string) => void;
}

export default function DeliveriesList({
  deliveries,
  selectedDeliveries,
  toggleDeliverySelection,
  getMotoboyName,
  formatPlatform,
  handleUpdateDeliveryStatus,
  motoboys,
  assignSelectedDeliveriesToMotoboy
}: DeliveriesListProps) {
  return (
    <div className="overflow-x-auto">
      {selectedDeliveries.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
          <div className="text-blue-800">
            <span className="font-semibold">{selectedDeliveries.length}</span> entrega(s) selecionada(s)
          </div>
          <div className="flex items-center">
            {motoboys.length > 0 && (
              <div>
                <label htmlFor="assign-motoboy" className="sr-only">Atribuir para motoboy</label>
                <select
                  id="assign-motoboy"
                  className="mr-2 p-2 border border-blue-300 rounded-md text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      assignSelectedDeliveriesToMotoboy(e.target.value);
                    }
                  }}
                  value=""
                  title="Selecione um motoboy para atribuir"
                >
                  <option value="">Atribuir para...</option>
                  {motoboys.map(motoboy => (
                    <option key={motoboy.id} value={motoboy.id}>{motoboy.nome}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => toggleDeliverySelection('clear')}
              className="text-blue-600 hover:text-blue-800 p-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <table className="min-w-full bg-white rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-10 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input 
                type="checkbox" 
                checked={selectedDeliveries.length > 0 && selectedDeliveries.length === deliveries.filter(d => d.status === 'pendente').length}
                onChange={(e) => {
                  if (e.target.checked) {
                    toggleDeliverySelection('selectAll');
                  } else {
                    toggleDeliverySelection('clear');
                  }
                }}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                title="Selecionar todas as entregas pendentes"
              />
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plataforma</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motoboy</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {deliveries.length > 0 ? (
            deliveries.map((delivery) => (
              <tr key={delivery.id} className={`hover:bg-gray-50 ${selectedDeliveries.includes(delivery.id) ? 'bg-blue-50' : ''}`}>
                <td className="px-2 py-3 whitespace-nowrap text-center">
                  {delivery.status === 'pendente' && (
                    <input 
                      type="checkbox" 
                      checked={selectedDeliveries.includes(delivery.id)}
                      onChange={() => toggleDeliverySelection(delivery.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      title="Selecionar entrega"
                    />
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(delivery.data).toLocaleDateString()}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatPlatform(delivery.origem)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                  {getMotoboyName(delivery.motoboy_id)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                  {delivery.endereco ? `${delivery.endereco.substring(0, 20)}... (${delivery.bairro})` : '-'}
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                  R$ {delivery.valor_entrega.toFixed(2)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    delivery.status === 'entregue' ? 'bg-green-100 text-green-800' : 
                    delivery.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {delivery.status || 'pendente'}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                  {delivery.status !== 'entregue' ? (
                    <button
                      onClick={() => handleUpdateDeliveryStatus(delivery.id, 'entregue')}
                      className="text-green-600 hover:text-green-900 mr-2"
                      title="Marcar como entregue"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateDeliveryStatus(delivery.id, 'pendente')}
                      className="text-yellow-600 hover:text-yellow-900 mr-2"
                      title="Marcar como pendente"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                Nenhuma entrega registrada
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

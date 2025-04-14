
import React from 'react';
import { Edit, Trash } from 'lucide-react';

interface Motoboy {
  id: string;
  nome: string;
  telefone?: string;
  placa?: string;
  status?: string;
}

interface MotoboysListProps {
  motoboys: Motoboy[];
  pendingDeliveriesByMotoboy: {[key: string]: number};
  onEdit: (motoboy: Motoboy) => void;
  onDelete: (id: string) => void;
}

export default function MotoboysList({ 
  motoboys, 
  pendingDeliveriesByMotoboy, 
  onEdit, 
  onDelete 
}: MotoboysListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entregas Pendentes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {motoboys.length > 0 ? (
            motoboys.map((motoboy) => (
              <tr key={motoboy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{motoboy.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{motoboy.telefone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{motoboy.placa || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    pendingDeliveriesByMotoboy[motoboy.id] > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pendingDeliveriesByMotoboy[motoboy.id] || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    motoboy.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {motoboy.status || 'ativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(motoboy)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(motoboy.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                Nenhum motoboy cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

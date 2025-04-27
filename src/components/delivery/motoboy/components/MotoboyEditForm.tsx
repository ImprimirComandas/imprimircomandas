
import React from 'react';
import { Save, X } from 'lucide-react';
import { Motoboy } from '../../../../types';

interface MotoboyEditFormProps {
  motoboy: Motoboy;
  onCancel: () => void;
  onSave: (motoboy: Motoboy) => Promise<void>;
}

export default function MotoboyEditForm({ motoboy, onCancel, onSave }: MotoboyEditFormProps) {
  const [editingMotoboy, setEditingMotoboy] = React.useState(motoboy);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome
        </label>
        <input
          type="text"
          value={editingMotoboy.nome}
          onChange={(e) =>
            setEditingMotoboy({
              ...editingMotoboy,
              nome: e.target.value,
            })
          }
          placeholder="Digite o nome do motoboy"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telefone
        </label>
        <input
          type="tel"
          value={editingMotoboy.telefone}
          onChange={(e) =>
            setEditingMotoboy({
              ...editingMotoboy,
              telefone: e.target.value,
            })
          }
          placeholder="Digite o telefone do motoboy"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          onClick={() => onSave(editingMotoboy)}
          className="p-2 rounded-full text-green-600 hover:bg-green-100"
        >
          <Save className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

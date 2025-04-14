
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MotoboyFormProps {
  editingMotoboy: {
    id: string;
    nome: string;
    telefone?: string;
    placa?: string;
  } | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  motoboyName: string;
  setMotoboyName: (value: string) => void;
  motoboyPhone: string;
  setMotoboyPhone: (value: string) => void;
  motoboyPlate: string; 
  setMotoboyPlate: (value: string) => void;
}

export default function MotoboyForm({ 
  editingMotoboy, 
  onSubmit, 
  onCancel,
  motoboyName,
  setMotoboyName,
  motoboyPhone,
  setMotoboyPhone,
  motoboyPlate,
  setMotoboyPlate
}: MotoboyFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 p-4 rounded-md mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome*</label>
          <input
            type="text"
            value={motoboyName}
            onChange={(e) => setMotoboyName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Nome do motoboy"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
          <input
            type="text"
            value={motoboyPhone}
            onChange={(e) => setMotoboyPhone(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Telefone"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
          <input
            type="text"
            value={motoboyPlate}
            onChange={(e) => setMotoboyPlate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Placa da moto"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          {editingMotoboy ? 'Atualizar' : 'Cadastrar'} Motoboy
        </button>
      </div>
    </form>
  );
}

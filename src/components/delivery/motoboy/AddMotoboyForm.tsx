
import { useState } from 'react';
import { Button } from '../../ui/button';
import { AddMotoboyFormProps } from './index';

export default function AddMotoboyForm({ onSubmit, loading, onCancel }: AddMotoboyFormProps) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(nome, telefone);
    setNome('');
    setTelefone('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium leading-none">
            Nome
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Nome do motoboy"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="telefone" className="text-sm font-medium leading-none">
            Telefone
          </label>
          <input
            id="telefone"
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Adicionando...' : 'Adicionar Motoboy'}
        </Button>
      </div>
    </form>
  );
}

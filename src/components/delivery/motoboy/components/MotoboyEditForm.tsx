
import React from 'react';
import { Save, X } from 'lucide-react';
import { Motoboy } from '../../../../types';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MotoboyEditFormProps {
  motoboy: Motoboy;
  onCancel: () => void;
  onSave: (motoboy: Motoboy) => Promise<void>;
}

export default function MotoboyEditForm({ motoboy, onCancel, onSave }: MotoboyEditFormProps) {
  const [editingMotoboy, setEditingMotoboy] = React.useState(motoboy);
  const { isDark } = useTheme();

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="nome" className="block text-sm font-medium text-foreground mb-1">
          Nome
        </Label>
        <Input
          id="nome"
          type="text"
          value={editingMotoboy.nome}
          onChange={(e) =>
            setEditingMotoboy({
              ...editingMotoboy,
              nome: e.target.value,
            })
          }
          placeholder="Digite o nome do motoboy"
          className="w-full bg-background text-foreground"
        />
      </div>
      <div>
        <Label htmlFor="telefone" className="block text-sm font-medium text-foreground mb-1">
          Telefone
        </Label>
        <Input
          id="telefone"
          type="tel"
          value={editingMotoboy.telefone}
          onChange={(e) =>
            setEditingMotoboy({
              ...editingMotoboy,
              telefone: e.target.value,
            })
          }
          placeholder="Digite o telefone do motoboy"
          className="w-full bg-background text-foreground"
        />
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
        >
          <X className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSave(editingMotoboy)}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          <Save className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

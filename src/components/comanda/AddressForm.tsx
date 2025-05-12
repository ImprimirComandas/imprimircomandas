import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface AddressFormProps {
  endereco: string;
  bairro: string;
  bairrosDisponiveis: string[];
  taxaentrega: number;
  onChange: (field: string, value: string) => void;
  onBairroChange: (bairro: string) => void;
}
export const AddressForm: React.FC<AddressFormProps> = ({
  endereco,
  bairro,
  bairrosDisponiveis,
  taxaentrega,
  onChange,
  onBairroChange
}) => {
  const {
    isDark
  } = useTheme();
  return <div className="space-y-4 mt-6">
      <div className="grid gap-2">
        <Label htmlFor="endereco" className="text-foreground">
          Endereço de Entrega
        </Label>
        <Input id="endereco" type="text" value={endereco || ''} onChange={e => onChange('endereco', e.target.value)} placeholder="Endereço de entrega" required className="w-full p-2 border rounded bg-background text-foreground border-input focus:ring-2 focus:ring-primary focus:outline-none" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bairro" className="text-foreground">
          Bairro
        </Label>
        {bairrosDisponiveis.length > 0 ? <select id="bairro" value={bairro || ''} onChange={e => onBairroChange(e.target.value)} className="w-full p-2 border rounded bg-background text-foreground border-input focus:ring-2 focus:ring-primary focus:outline-none" required>
            <option value="">Selecione o bairro</option>
            {bairrosDisponiveis.map(bairroOption => <option key={bairroOption} value={bairroOption}>
                {bairroOption} {bairro === bairroOption && taxaentrega > 0 ? `(R$ ${taxaentrega.toFixed(2)})` : ''}
              </option>)}
          </select> : <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-3 rounded">
            Nenhum bairro cadastrado. Por favor, adicione bairros nas configurações.
          </div>}
      </div>
    </div>;
};

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PaymentTotal } from './payment/PaymentTotal';
import { PaymentOptions } from './payment/PaymentOptions';
import { Checkbox } from '../ui/checkbox';
import { useTheme } from '@/hooks/useTheme';

interface PaymentSectionProps {
  subtotal: number;
  taxaentrega: number;
  totalComTaxa: number;
  forma_pagamento: '' | 'pix' | 'dinheiro' | 'cartao' | 'misto';
  pago: boolean;
  isShopOpen: boolean;
  onFormaPagamentoChange: (forma: 'pix' | 'dinheiro' | 'cartao' | 'misto' | '') => void;
  onChange: (field: string, value: boolean) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  subtotal,
  taxaentrega,
  totalComTaxa,
  forma_pagamento,
  pago,
  isShopOpen,
  onFormaPagamentoChange,
  onChange,
}) => {
  const { isDark } = useTheme();
  
  const handlePagoChange = (checked: boolean) => {
    console.log('Payment status changed to:', checked);
    onChange('pago', checked);
  };

  return (
    <div className="mb-6">
      <PaymentTotal
        subtotal={subtotal}
        taxaentrega={taxaentrega}
        total={totalComTaxa}
      />

      <PaymentOptions
        forma_pagamento={forma_pagamento}
        onFormaPagamentoChange={onFormaPagamentoChange}
      />

      <div className="flex items-center gap-2 mt-4">
        <Checkbox
          id="pago"
          checked={pago}
          onCheckedChange={handlePagoChange}
        />
        <label htmlFor="pago" className="text-sm font-medium text-foreground cursor-pointer">
          Pedido Pago
        </label>
      </div>

      {!isShopOpen && (
        <div className="mt-4 rounded-md bg-destructive/10 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-destructive">Atenção</h3>
              <div className="mt-2 text-sm text-destructive/80">
                <p>A loja está fechada. Não é possível cadastrar novos pedidos.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

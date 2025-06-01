
import TotaisPorStatusPagamento from '../TotaisPorStatusPagamento';
import ComandasAnterioresModificado from '../ComandasAnterioresModificado';
import GrowthChart from './GrowthChart';
import type { Comanda } from '../../types/database';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '../ui/card';
import { Clock } from 'lucide-react';

interface RightColumnProps {
  totais: {
    confirmados: number;
    naoConfirmados: number;
    geral: number;
  };
  showValues: boolean;
  toggleShowValues: () => void;
  comandasAnteriores: Comanda[];
  expandedComandas: Record<string, boolean>;
  carregando: boolean;
  reimprimirComanda: (comanda: Comanda) => void;
  excluirComanda: (id: string) => void;
  toggleExpandComanda: (id: string) => void;
  getUltimos8Digitos: (id: string | undefined) => string;
  onConfirmPayment: (comanda: Comanda) => void;
}

export default function RightColumn({
  totais,
  showValues,
  toggleShowValues,
  comandasAnteriores,
  expandedComandas,
  carregando,
  reimprimirComanda,
  excluirComanda,
  toggleExpandComanda,
  getUltimos8Digitos,
  onConfirmPayment
}: RightColumnProps) {
  // Filter to only show unconfirmed orders
  const pendingOrders = comandasAnteriores.filter(comanda => !comanda.pago);
  const { isDark, theme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Comandas Pendentes - Moved to the top as requested */}
      <Card className="border border-border bg-card p-5">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <Clock className="h-5 w-5 text-primary mr-2" />
          Pedidos Pendentes
        </h3>
        <ComandasAnterioresModificado
          comandas={pendingOrders}
          expandedComandas={expandedComandas}
          carregando={carregando}
          onReimprimir={reimprimirComanda}
          onExcluir={excluirComanda}
          onToggleExpand={toggleExpandComanda}
          getUltimos8Digitos={getUltimos8Digitos}
          onConfirmPayment={onConfirmPayment}
        />
      </Card>

      {/* Totais por Status */}
      <TotaisPorStatusPagamento
        totais={{
          confirmados: totais.confirmados || 0,
          naoConfirmados: totais.naoConfirmados || 0,
          total: totais.geral || 0
        }}
        showValues={showValues}
        toggleShowValues={toggleShowValues}
      />

      {/* Growth Chart - Now self-contained */}
      <GrowthChart />
    </div>
  );
}

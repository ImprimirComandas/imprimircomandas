
import { motion } from 'framer-motion';
import TotaisPorStatusPagamento from '../TotaisPorStatusPagamento';
import ComandasAnterioresModificado from '../ComandasAnterioresModificado';
import GrowthChart from './GrowthChart';
import type { Comanda } from '../../types/database';
import { TotaisCardProps } from '../../types';

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
  chartData: { name: string; Pedidos: number; Valor: number }[];
}

export function TotaisCard({ confirmados, naoConfirmados, total, showValues, toggleShowValues }: TotaisCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <TotaisPorStatusPagamento
        confirmados={confirmados || 0}
        naoConfirmados={naoConfirmados || 0}
        total={total || 0}
        showValues={showValues}
        toggleShowValues={toggleShowValues}
      />
    </div>
  );
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
  onConfirmPayment,
  chartData
}: RightColumnProps) {
  // Filter to only show unconfirmed orders
  const pendingOrders = comandasAnteriores.filter(comanda => !comanda.pago);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="lg:w-1/2 space-y-6"
    >
      {/* Totais por Status */}
      <TotaisCard
        confirmados={totais.confirmados || 0}
        naoConfirmados={totais.naoConfirmados || 0}
        total={totais.geral || 0}
        showValues={showValues}
        toggleShowValues={toggleShowValues}
      />

      {/* Comandas Anteriores - Only Pending Orders */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4">Pedidos Pendentes</h2>
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
      </div>

      {/* Gráfico de Crescimento */}
      <GrowthChart chartData={chartData} />
    </motion.div>
  );
}

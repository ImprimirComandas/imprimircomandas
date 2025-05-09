
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface OrderStatsProps {
  confirmados: number;
  naoConfirmados: number;
  total: number;
}

export function OrderStats({ confirmados, naoConfirmados, total }: OrderStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      <Card className="p-4 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800">
        <p className="text-sm font-medium text-green-800 dark:text-green-100">Confirmados</p>
        <p className="text-lg font-bold text-green-900 dark:text-green-50">R$ {confirmados.toFixed(2)}</p>
      </Card>
      
      <Card className="p-4 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800">
        <p className="text-sm font-medium text-red-800 dark:text-red-100">Não Confirmados</p>
        <p className="text-lg font-bold text-red-900 dark:text-red-50">R$ {naoConfirmados.toFixed(2)}</p>
      </Card>
      
      <Card className="p-4 bg-muted border-border">
        <p className="text-sm font-medium text-muted-foreground">Total</p>
        <p className="text-lg font-bold text-foreground">R$ {total.toFixed(2)}</p>
      </Card>
    </motion.div>
  );
}

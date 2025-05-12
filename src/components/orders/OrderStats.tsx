
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';

interface OrderStatsProps {
  confirmados: number;
  naoConfirmados: number;
  total: number;
}

export function OrderStats({ confirmados, naoConfirmados, total }: OrderStatsProps) {
  const { theme, isDark } = useTheme();
  const isSupabase = theme === 'supabase';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      <Card className={`p-4 border ${isSupabase ? 'bg-card/50 backdrop-blur-sm border-green-600' : 'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800'}`}>
        <p className={`text-sm font-medium ${isSupabase ? 'text-green-400' : 'text-green-800 dark:text-green-100'}`}>Confirmados</p>
        <p className={`text-lg font-bold ${isSupabase ? 'text-green-500' : 'text-green-900 dark:text-green-50'}`}>R$ {confirmados.toFixed(2)}</p>
      </Card>
      
      <Card className={`p-4 border ${isSupabase ? 'bg-card/50 backdrop-blur-sm border-red-600' : 'bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800'}`}>
        <p className={`text-sm font-medium ${isSupabase ? 'text-red-400' : 'text-red-800 dark:text-red-100'}`}>Não Confirmados</p>
        <p className={`text-lg font-bold ${isSupabase ? 'text-red-500' : 'text-red-900 dark:text-red-50'}`}>R$ {naoConfirmados.toFixed(2)}</p>
      </Card>
      
      <Card className="p-4 bg-muted border-border">
        <p className="text-sm font-medium text-muted-foreground">Total</p>
        <p className="text-lg font-bold text-foreground">R$ {total.toFixed(2)}</p>
      </Card>
    </motion.div>
  );
}

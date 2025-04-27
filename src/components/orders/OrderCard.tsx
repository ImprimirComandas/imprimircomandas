import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Edit2, Printer, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Comanda } from '@/types';
import { getUltimos8Digitos } from '@/utils/printService';
import { OrderExpandedView } from './OrderExpandedView';

interface OrderCardProps {
  comanda: Comanda;
  onTogglePayment: (comanda: Comanda) => Promise<boolean>;
  onReprint: (comanda: Comanda) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function OrderCard({ comanda, onTogglePayment, onReprint, onDelete }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-4 mb-4"
    >
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            Pedido #{getUltimos8Digitos(comanda.id)}
          </h3>
          <p className="text-sm text-gray-500">
            {format(new Date(comanda.data), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReprint(comanda)}
          >
            <Printer size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(comanda.id)}
          >
            <Trash2 size={16} />
          </Button>

          <Button
            variant={comanda.pago ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onTogglePayment(comanda)}
          >
            {comanda.pago ? 'Pago' : 'Pendente'}
          </Button>
        </div>
      </div>

      {isExpanded && <OrderExpandedView comanda={comanda} isEditing={isEditing} />}
    </motion.div>
  );
}

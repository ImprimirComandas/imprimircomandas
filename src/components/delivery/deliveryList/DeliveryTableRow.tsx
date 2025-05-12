
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { DeliveryTableRowProps } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";

export default function DeliveryTableRow({ 
  delivery, 
  onDelete, 
  onEdit,
  showDeleteButton 
}: DeliveryTableRowProps) {
  const { isDark } = useTheme();
  
  return (
    <TableRow className="border-border transition-colors duration-200">
      <TableCell className="font-medium text-foreground">
        {format(new Date(delivery.created_at || ''), 'HH:mm')}
      </TableCell>
      <TableCell className="text-foreground">{delivery.bairro}</TableCell>
      <TableCell className="text-foreground">
        <span className="font-mono">
          R$ {delivery.valor_entrega?.toFixed(2)}
        </span>
      </TableCell>
      <TableCell className="capitalize text-foreground">{delivery.origem}</TableCell>
      <TableCell>
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          delivery.forma_pagamento === 'dinheiro' 
            ? 'bg-emerald-500/20 text-emerald-500' 
            : delivery.forma_pagamento === 'cartao' 
            ? 'bg-blue-500/20 text-blue-500' 
            : delivery.forma_pagamento === 'pix'
            ? 'bg-purple-500/20 text-purple-500'
            : 'bg-gray-500/20 text-gray-500'
        }`}>
          {delivery.forma_pagamento}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/90 hover:bg-primary/10"
            onClick={() => onEdit(delivery)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          {showDeleteButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={() => onDelete(delivery)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

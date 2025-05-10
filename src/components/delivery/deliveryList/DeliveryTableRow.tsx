
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { DeliveryTableRowProps } from "@/types";
import { useTheme } from "@/hooks/useTheme";

export default function DeliveryTableRow({ 
  delivery, 
  onDelete, 
  onEdit,
  showDeleteButton 
}: DeliveryTableRowProps) {
  const { isDark } = useTheme();
  
  return (
    <TableRow className="border-border">
      <TableCell>
        {format(new Date(delivery.created_at || ''), 'HH:mm')}
      </TableCell>
      <TableCell>{delivery.bairro}</TableCell>
      <TableCell>R$ {delivery.valor_entrega?.toFixed(2)}</TableCell>
      <TableCell className="capitalize">{delivery.origem}</TableCell>
      <TableCell className="capitalize">
        {delivery.forma_pagamento}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/90 hover:bg-accent"
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

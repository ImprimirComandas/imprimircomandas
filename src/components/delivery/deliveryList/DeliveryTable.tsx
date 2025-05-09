
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DeliveryTableRow from "./DeliveryTableRow";
import { DeliveryTableProps } from "@/types";
import { useTheme } from "@/hooks/useTheme";

export default function DeliveryTable({ 
  deliveries, 
  onDeleteDelivery,
  onEditDelivery, 
  showDeleteButton 
}: DeliveryTableProps) {
  const { isDark } = useTheme();
  
  return (
    <div className={`mt-2 overflow-x-auto ${isDark ? 'text-foreground' : ''}`}>
      <Table>
        <TableHeader>
          <TableRow className={`${isDark ? 'border-border' : ''}`}>
            <TableHead>Horário</TableHead>
            <TableHead>Bairro</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery) => (
            <DeliveryTableRow
              key={delivery.id}
              delivery={delivery}
              onDelete={onDeleteDelivery || (() => {})}
              onEdit={onEditDelivery || (() => {})}
              showDeleteButton={showDeleteButton}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

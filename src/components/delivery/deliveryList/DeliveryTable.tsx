
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DeliveryTableRow from "./DeliveryTableRow";
import { DeliveryTableProps } from "@/types";

export default function DeliveryTable({ 
  deliveries, 
  onDeleteDelivery,
  onEditDelivery, 
  showDeleteButton 
}: DeliveryTableProps) {
  return (
    <div className="mt-2 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
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

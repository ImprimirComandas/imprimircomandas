
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DeliveryTableRow from "./DeliveryTableRow";
import { DeliveryTableProps } from "@/types";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";

export default function DeliveryTable({ 
  deliveries, 
  onDeleteDelivery,
  onEditDelivery, 
  showDeleteButton 
}: DeliveryTableProps) {
  const { theme } = useTheme();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-2 overflow-x-auto rounded-lg border border-border bg-card/30 backdrop-blur-sm"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-medium text-foreground">Horário</TableHead>
            <TableHead className="font-medium text-foreground">Bairro</TableHead>
            <TableHead className="font-medium text-foreground">Valor</TableHead>
            <TableHead className="font-medium text-foreground">Origem</TableHead>
            <TableHead className="font-medium text-foreground">Pagamento</TableHead>
            <TableHead className="font-medium text-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nenhuma entrega encontrada.
              </TableCell>
            </TableRow>
          ) : (
            deliveries.map((delivery) => (
              <DeliveryTableRow
                key={delivery.id}
                delivery={delivery}
                onDelete={onDeleteDelivery || (() => {})}
                onEdit={onEditDelivery || (() => {})}
                showDeleteButton={showDeleteButton}
              />
            ))
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
}

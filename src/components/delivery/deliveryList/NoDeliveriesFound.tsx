
import { AlertCircle } from "lucide-react";

export default function NoDeliveriesFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <AlertCircle className="h-12 w-12 mb-4" />
      <p className="text-lg">Nenhuma entrega encontrada para esta data</p>
    </div>
  );
}

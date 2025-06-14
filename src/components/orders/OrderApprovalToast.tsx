
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Props: orderId, onApprove, onReject
export function OrderApprovalToast({ orderId, onApprove, onReject }: {
  orderId: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  // Rendered by Toast system
  return (
    <div className="flex flex-col gap-2">
      <div className="font-bold">Novo pedido recebido</div>
      <div className="text-xs text-muted-foreground">Pedido ID: {orderId}</div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onApprove}>
          Aceitar
        </Button>
        <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={onReject}>
          Recusar
        </Button>
      </div>
    </div>
  );
}

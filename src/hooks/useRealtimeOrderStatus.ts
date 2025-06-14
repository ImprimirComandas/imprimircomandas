
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type UseRealtimeOrderStatusProps = {
  orderId: string | null;
  onStatusChange: (status: string) => void;
};

/**
 * Listens to real-time changes of a specific order by ID,
 * calls onStatusChange on every status update.
 */
export function useRealtimeOrderStatus({ orderId, onStatusChange }: UseRealtimeOrderStatusProps) {
  useEffect(() => {
    if (!orderId) return undefined;
    const channel = supabase.channel("public:online_orders")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "online_orders",
          filter: `id=eq.${orderId}`,
        },
        payload => {
          const newStatus = payload.new?.status || payload.new?.mercado_pago_status;
          if (newStatus) {
            onStatusChange(newStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, onStatusChange]);
}

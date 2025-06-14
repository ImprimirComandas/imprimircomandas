
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function usePendingComandasCount(userId: string | undefined) {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!userId) {
        setPendingCount(0);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("comandas")
        .select("id")
        .eq("user_id", userId)
        .eq("pago", false);

      if (error) {
        setPendingCount(0); // Fallback: permita, mas alerte em log
        console.error("Erro ao buscar comandas pendentes:", error);
      } else {
        setPendingCount(data?.length ?? 0);
      }
      setLoading(false);
    }

    load();
  }, [userId]);

  return { pendingCount, loading };
}

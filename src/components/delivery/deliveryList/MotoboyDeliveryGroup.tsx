
import React from "react";
import { Truck, ChevronDown, ChevronRight, Calendar } from "lucide-react";
import DeliveryTable from "./DeliveryTable";
import { format } from "date-fns";
import { Entrega } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";

interface MotoboyDeliveryGroupProps {
  motoboyId: string;
  data: {
    motoboyName: string;
    deliveriesByDate: {
      [date: string]: Entrega[];
    };
    totalValue: number;
  };
  onDeleteDelivery: (delivery: Entrega) => void;
  onEditDelivery: (delivery: Entrega) => void;
  isSessionActive: boolean;
  expandedMotoboys: {[key: string]: boolean};
  expandedDates: {[key: string]: boolean};
  onToggleMotoboy: (motoboyId: string) => void;
  onToggleDate: (dateKey: string) => void;
}

export default function MotoboyDeliveryGroup({
  motoboyId,
  data,
  onDeleteDelivery,
  onEditDelivery,
  isSessionActive,
  expandedMotoboys,
  expandedDates,
  onToggleMotoboy,
  onToggleDate,
}: MotoboyDeliveryGroupProps) {
  const { theme, isDark } = useTheme();

  return (
    <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => onToggleMotoboy(motoboyId)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${isSessionActive ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
            <Truck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="font-medium text-foreground">{data.motoboyName}</span>
            <div className="text-xs text-muted-foreground">
              {Object.values(data.deliveriesByDate).flat().length} entregas
              {isSessionActive && <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">Ativo</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary">
            R$ {data.totalValue.toFixed(2)}
          </span>
          {expandedMotoboys[motoboyId] ? 
            <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
            <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </div>
      </button>

      {expandedMotoboys[motoboyId] && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 pt-0"
        >
          {Object.entries(data.deliveriesByDate).map(([date, deliveries]) => (
            <div key={date} className="mb-4 last:mb-0">
              <button
                onClick={() => onToggleDate(`${motoboyId}-${date}`)}
                className="w-full flex items-center justify-between py-2 px-3 my-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">
                    {format(new Date(date), 'dd/MM/yyyy')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({deliveries.length} entregas)
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-primary mr-2">
                    R$ {deliveries.reduce((sum, d) => sum + d.valor_entrega, 0).toFixed(2)}
                  </span>
                  {expandedDates[`${motoboyId}-${date}`] ? 
                    <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {expandedDates[`${motoboyId}-${date}`] && (
                <DeliveryTable
                  deliveries={deliveries}
                  onDeleteDelivery={onDeleteDelivery}
                  onEditDelivery={onEditDelivery}
                  showDeleteButton={true}
                />
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

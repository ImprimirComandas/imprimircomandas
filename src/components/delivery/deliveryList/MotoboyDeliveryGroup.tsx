
import { useState } from "react";
import { Truck } from "lucide-react";
import DeliveryTable from "./DeliveryTable";
import { format } from "date-fns";
import { Entrega } from "@/types";

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
  return (
    <div className="border rounded-lg">
      <button
        onClick={() => onToggleMotoboy(motoboyId)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          <span className="font-medium">{data.motoboyName}</span>
          <span className="text-sm text-gray-500">
            ({Object.values(data.deliveriesByDate).flat().length} entregas)
          </span>
        </div>
        <div className="font-medium text-blue-600">
          Total: R$ {data.totalValue.toFixed(2)}
        </div>
      </button>

      {expandedMotoboys[motoboyId] && (
        <div className="p-4">
          {Object.entries(data.deliveriesByDate).map(([date, deliveries]) => (
            <div key={date} className="mb-4">
              <button
                onClick={() => onToggleDate(`${motoboyId}-${date}`)}
                className="w-full flex items-center justify-between p-2 bg-gray-100 rounded-lg mb-2"
              >
                <span className="font-medium">
                  {format(new Date(date), 'dd/MM/yyyy')}
                </span>
                <span className="text-sm text-gray-600">
                  {deliveries.length} entregas
                </span>
              </button>

              {expandedDates[`${motoboyId}-${date}`] && (
                <DeliveryTable
                  deliveries={deliveries}
                  onDeleteDelivery={onDeleteDelivery}
                  onEditDelivery={onEditDelivery}
                  showDeleteButton={isSessionActive}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

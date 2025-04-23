
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DeliveryDatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function DeliveryDatePicker({ selectedDate, onDateSelect }: DeliveryDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {format(selectedDate, 'dd/MM/yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="rounded-md border p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}


import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, duration = 4000, variant, ...props }) {
        // Add state to control the progress bar animation
        const [progress, setProgress] = React.useState(100);
        const timerRef = React.useRef<ReturnType<typeof setInterval>>();

        React.useEffect(() => {
          if (timerRef.current) clearInterval(timerRef.current);
          
          // Update the progress bar every 10ms
          const totalIterations = duration / 10;
          const progressDecrement = 100 / totalIterations;
          
          timerRef.current = setInterval(() => {
            setProgress((prev) => {
              const newProgress = prev - progressDecrement;
              return newProgress > 0 ? newProgress : 0;
            });
          }, 10);
          
          return () => {
            if (timerRef.current) clearInterval(timerRef.current);
          };
        }, [duration]);

        // Safely extract className from props
        const propsWithClassName = props as { className?: string };
        const className = propsWithClassName.className || "";

        return (
          <Toast 
            key={id} 
            {...props} 
            variant={variant}
            className={cn("relative overflow-hidden", className)}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
            
            {/* Progress bar */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-primary"
              style={{ width: `${progress}%`, transition: "width 10ms linear" }}
            />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

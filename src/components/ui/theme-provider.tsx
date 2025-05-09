
import * as React from "react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: string;
  setTheme: (theme: string) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

type ThemeProviderComponentProps = {
  children: React.ReactNode;
  className?: string;
};

export function ThemeProviderComponent({
  children,
  className,
}: ThemeProviderComponentProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`theme-${theme} ${className}`}>
      {children}
    </div>
  );
}

export function ThemedCard({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card text-card-foreground border border-border rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

export function ThemedSection({ 
  children, 
  className = "",
  title,
  description
}: { 
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <section className={`mb-8 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      )}
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}
      <div className="bg-card text-card-foreground border border-border rounded-lg p-6">
        {children}
      </div>
    </section>
  );
}

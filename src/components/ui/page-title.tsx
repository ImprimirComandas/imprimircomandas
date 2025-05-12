
import React from 'react';
import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageTitle({ 
  title, 
  description, 
  className 
}: PageTitleProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}


import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  delay?: number;
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  title, 
  description,
  className = '',
  delay = 0
}) => {
  const { isDark } = useTheme();
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`mb-8 ${className}`}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          )}
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        {children}
      </div>
    </motion.section>
  );
};

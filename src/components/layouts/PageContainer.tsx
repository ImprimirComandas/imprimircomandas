
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  withGradient?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className = '',
  withGradient = true
}) => {
  const { isDark } = useTheme();
  
  const baseClasses = 'min-h-screen py-10 px-4 sm:px-6 lg:px-8';
  
  // Background classes based on theme
  const bgClasses = withGradient 
    ? isDark
      ? 'bg-gradient-to-br from-background/95 via-background to-background/90'
      : 'bg-gradient-to-br from-blue-100/50 via-background to-gray-100/50'
    : 'bg-background';
    
  return (
    <div className={`${baseClasses} ${bgClasses} ${className} transition-colors duration-300`}>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {children}
      </motion.div>
    </div>
  );
};

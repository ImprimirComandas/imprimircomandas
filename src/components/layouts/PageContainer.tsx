
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
  const { isDark, theme } = useTheme();
  
  const isSupabase = theme === 'supabase';
  
  const baseClasses = 'min-h-screen py-8 px-4 sm:px-6 lg:px-8 w-full';
  
  // Background classes based on theme
  const bgClasses = withGradient 
    ? isSupabase
      ? 'bg-gradient-to-br from-background via-background/95 to-background/90'
      : isDark
        ? 'bg-gradient-to-br from-background/95 via-background to-background/90'
        : 'bg-gradient-to-br from-blue-100/50 via-background to-gray-100/50'
    : 'bg-background';
    
  return (
    <div className={`${baseClasses} ${bgClasses} ${className} transition-colors duration-300`}>
      {isSupabase && withGradient && (
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(circle_at_50%_120%,rgba(62,207,142,0.1),rgba(0,0,0,0))]"></div>
      )}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.3 }}
        className="w-full mx-auto"
      >
        {children}
      </motion.div>
    </div>
  );
};

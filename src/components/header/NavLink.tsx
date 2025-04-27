
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface NavLinkProps {
  to: string;
  pathname: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavLink = ({ 
  to, 
  pathname, 
  children, 
  className,
  style,
  onMouseEnter,
  onMouseLeave
}: NavLinkProps) => {
  const isActive = pathname === to;
  
  return (
    <Link 
      to={to} 
      className={cn(
        "relative text-sm font-medium",
        isActive ? "text-primary" : "text-foreground/80 hover:text-primary", 
        "transition-colors duration-300",
        className
      )}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Link>
  );
};

export default NavLink;

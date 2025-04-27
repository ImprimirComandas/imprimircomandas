
import { FC, ReactNode, CSSProperties } from 'react';
import { Link } from 'react-router-dom';

export interface NavLinkProps {
  to: string;
  pathname: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onMouseEnter?: (e: any) => void;
  onMouseLeave?: (e: any) => void;
}

const NavLink: FC<NavLinkProps> = ({ to, pathname, children, className, style, onMouseEnter, onMouseLeave }) => {
  const isActive = pathname === to;
  
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        isActive 
          ? 'text-foreground font-semibold' 
          : 'text-muted-foreground'
      } ${className || ''}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Link>
  );
};

export default NavLink;

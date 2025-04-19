
import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface NavLinkProps {
  to: string;
  pathname: string;
  children: ReactNode;
}

const NavLink: FC<NavLinkProps> = ({ to, pathname, children }) => {
  const isActive = pathname === to;
  
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        isActive 
          ? 'text-foreground font-semibold' 
          : 'text-muted-foreground'
      }`}
    >
      {children}
    </Link>
  );
};

export default NavLink;


import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export default function NavLink({ to, icon, label, onClick }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive 
          ? 'bg-blue-700 text-white' 
          : 'hover:bg-blue-700'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Link>
  );
}

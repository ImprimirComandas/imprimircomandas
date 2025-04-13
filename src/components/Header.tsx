
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Settings, LogOut, Calendar } from 'lucide-react';
import type { Profile } from '../types/database';

interface HeaderProps {
  profile: Profile | null;
  onSignOut: () => void;
  showProfileMenu: boolean;
  setShowProfileMenu: (show: boolean) => void;
}

export default function Header({ profile, onSignOut, showProfileMenu, setShowProfileMenu }: HeaderProps) {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Store className="h-8 w-8 mr-2" />
              <span className="font-semibold text-xl">{profile?.store_name || 'Dom Luiz Bebidas'}</span>
            </Link>
          </div>
          <div className="flex items-center">
            <nav className="flex space-x-2">
              <Link 
                to="/products" 
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <ShoppingBag className="h-5 w-5 mr-1" />
                <span>Produtos</span>
              </Link>
              <Link 
                to="/orders-by-day" 
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Calendar className="h-5 w-5 mr-1" />
                <span>Pedidos por Dia</span>
              </Link>
              <Link 
                to="/store-settings" 
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Settings className="h-5 w-5 mr-1" />
                <span>Configurações</span>
              </Link>
            </nav>
            <div className="ml-4 relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 rounded-full border-2 border-blue-400 p-1 hover:border-white focus:outline-none focus:border-white transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-blue-300 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || 'Usuário'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-blue-700">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
              </button>
              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{profile?.full_name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500 truncate">{profile?.email || ''}</p>
                    </div>
                    <button
                      onClick={onSignOut}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                      role="menuitem"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

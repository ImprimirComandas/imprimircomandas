import { User, Settings, LogOut, Package, Home } from 'lucide-react'; // Adicionei o ícone Home
import { Link } from 'react-router-dom';
import type { Profile } from '../types/database';

interface HeaderProps {
  profile: Profile | null;
  onSignOut: () => void;
  showProfileMenu: boolean;
  setShowProfileMenu: (value: boolean) => void;
}

export default function Header({ profile, onSignOut, showProfileMenu, setShowProfileMenu }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.store_name || 'Bem vindo'}
          </h1>
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
              <span>{profile?.full_name}</span>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <Link
                    to="/"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Home size={16} className="mr-2" />
                    Menu Principal
                  </Link>
                  <Link
                    to="/products"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Package size={16} className="mr-2" />
                    Produtos
                  </Link>
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Settings size={16} className="mr-2" />
                    Perfil
                  </button>
                  <button
                    onClick={onSignOut}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
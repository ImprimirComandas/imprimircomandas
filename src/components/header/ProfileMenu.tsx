
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import type { Profile } from '../../types/database';

interface ProfileMenuProps {
  profile: Profile | null;
  showProfileMenu: boolean;
  setShowProfileMenu: (show: boolean) => void;
  onSignOut: () => void;
}

export default function ProfileMenu({ profile, showProfileMenu, setShowProfileMenu, onSignOut }: ProfileMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center rounded-full border-2 border-blue-400 p-1 hover:border-white focus:outline-none focus:border-white transition-colors duration-200"
      >
        <div className="h-8 w-8 rounded-full bg-blue-300 flex items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || 'Usuário'}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-blue-700">
              {profile?.full_name?.charAt(0) || 'U'}
            </span>
          )}
        </div>
      </button>
      {showProfileMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-2">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="font-medium text-gray-900">{profile?.full_name || 'Usuário'}</p>
              <p className="text-xs text-gray-500 truncate">{profile?.email || ''}</p>
            </div>
            <button
              onClick={onSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

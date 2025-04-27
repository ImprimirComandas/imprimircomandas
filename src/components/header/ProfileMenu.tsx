
import { FC, Fragment } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Profile } from '../../types/database';
import { ProfileMenuProps } from '@/types';

const ProfileMenu: FC<ProfileMenuProps> = ({ 
  profile, 
  onSignOut, 
  showMenu, 
  setShowMenu,
  className
}) => {
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)
    : '?';
    
  return (
    <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
      <DropdownMenuTrigger asChild>
        <Avatar className={`h-8 w-8 cursor-pointer border border-border ${className || ''}`}>
          <AvatarImage src={profile?.avatar_url || ''} alt="Avatar" />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || 'Usuário'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.email || 'sem email'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/store-settings" className="flex w-full cursor-pointer items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="text-red-500 focus:text-red-500">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;

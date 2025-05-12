
import { FC } from 'react';
import { Moon, Sun, Palette, Database } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useTheme } from '../hooks/useTheme';

interface ThemeSelectorProps {
  className?: string;
}

const ThemeSelector: FC<ThemeSelectorProps> = ({ className }) => {
  const { theme, changeTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={className}
        >
          {theme === 'supabase' ? (
            <Database className="h-[1.2rem] w-[1.2rem] text-primary" />
          ) : theme === 'dark-green' ? (
            <Palette className="h-[1.2rem] w-[1.2rem] text-green-600" />
          ) : theme.includes('light') ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Mudar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Temas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => changeTheme('dark-green')}
          className={theme === 'dark-green' ? 'bg-accent' : ''}
        >
          <Palette className="mr-2 h-4 w-4 text-green-600" />
          <span>Verde Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('supabase')}
          className={theme === 'supabase' ? 'bg-accent' : ''}
        >
          <Database className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Supabase</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('light')}
          className={theme === 'light' ? 'bg-accent' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('dark')}
          className={theme === 'dark' ? 'bg-accent' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('light-blue')}
          className={theme === 'light-blue' ? 'bg-accent' : ''}
        >
          <Palette className="mr-2 h-4 w-4 text-blue-500" />
          <span>Azul Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('dark-purple')}
          className={theme === 'dark-purple' ? 'bg-accent' : ''}
        >
          <Palette className="mr-2 h-4 w-4 text-purple-500" />
          <span>Roxo Escuro</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;

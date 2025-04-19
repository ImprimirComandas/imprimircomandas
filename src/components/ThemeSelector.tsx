import { FC } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
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
        <Button variant="outline" size="icon" className={className}>
          {theme.includes('light') ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Mudar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Temas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => changeTheme('light')}
          className={theme === 'light' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('dark')}
          className={theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('light-blue')}
          className={theme === 'light-blue' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Palette className="mr-2 h-4 w-4 text-blue-500" />
          <span>Azul Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('dark-purple')}
          className={theme === 'dark-purple' ? 'bg-accent text-accent-foreground' : ''}
        >
          <Palette className="mr-2 h-4 w-4 text-purple-500" />
          <span>Roxo Escuro</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
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

  // Define estilos adaptáveis para cada tema
  const getThemeStyles = () => {
    switch (theme) {
      case 'light':
        return {
          button: 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100',
          menu: 'bg-white',
          item: 'text-gray-900 hover:bg-gray-100',
          selected: 'bg-gray-200 text-gray-900',
        };
      case 'dark':
        return {
          button: 'bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600',
          menu: 'bg-gray-800',
          item: 'text-gray-100 hover:bg-gray-700',
          selected: 'bg-gray-600 text-gray-100',
        };
      case 'light-blue':
        return {
          button: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100',
          menu: 'bg-blue-50',
          item: 'text-blue-900 hover:bg-blue-100',
          selected: 'bg-blue-200 text-blue-900',
        };
      case 'dark-purple':
        return {
          button: 'bg-purple-800 text-gray-100 border-purple-600 hover:bg-purple-700',
          menu: 'bg-purple-900',
          item: 'text-gray-100 hover:bg-purple-800',
          selected: 'bg-purple-700 text-gray-100',
        };
      default:
        return {
          button: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100', // Padrão: light-blue
          menu: 'bg-blue-50',
          item: 'text-blue-900 hover:bg-blue-100',
          selected: 'bg-blue-200 text-blue-900',
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`${className} ${styles.button}`}
        >
          {theme.includes('light') ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Mudar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.menu}>
        <DropdownMenuLabel className={styles.item}>Temas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => changeTheme('light')}
          className={`${theme === 'light' ? styles.selected : ''} ${styles.item}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('dark')}
          className={`${theme === 'dark' ? styles.selected : ''} ${styles.item}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('light-blue')}
          className={`${theme === 'light-blue' ? styles.selected : ''} ${styles.item}`}
        >
          <Palette className="mr-2 h-4 w-4 text-blue-500" />
          <span>Azul Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('dark-purple')}
          className={`${theme === 'dark-purple' ? styles.selected : ''} ${styles.item}`}
        >
          <Palette className="mr-2 h-4 w-4 text-purple-500" />
          <span>Roxo Escuro</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;

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
import { getThemeClasses } from '../lib/theme';

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
          className={`${className} ${getThemeClasses(theme, {
            light: "bg-white text-gray-900 border-gray-300 hover:bg-gray-100",
            dark: "bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600",
            lightBlue: "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100",
            darkPurple: "bg-purple-800 text-gray-100 border-purple-600 hover:bg-purple-700"
          })}`}
        >
          {theme.includes('light') ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Mudar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={getThemeClasses(theme, {
        light: "bg-white",
        dark: "bg-gray-800",
        lightBlue: "bg-blue-50",
        darkPurple: "bg-purple-900"
      })}>
        <DropdownMenuLabel className={getThemeClasses(theme, {
          light: "text-gray-900",
          dark: "text-gray-100",
          lightBlue: "text-blue-900",
          darkPurple: "text-gray-100"
        })}>Temas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => changeTheme('light')}
          className={`${theme === 'light' ? getThemeClasses(theme, {
            light: "bg-gray-200 text-gray-900",
            dark: "bg-gray-600 text-gray-100",
            lightBlue: "bg-blue-200 text-blue-900",
            darkPurple: "bg-purple-700 text-gray-100"
          }) : ""} ${getThemeClasses(theme, {
            light: "text-gray-900 hover:bg-gray-100",
            dark: "text-gray-100 hover:bg-gray-700",
            lightBlue: "text-blue-900 hover:bg-blue-100",
            darkPurple: "text-gray-100 hover:bg-purple-800"
          })}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('dark')}
          className={`${theme === 'dark' ? getThemeClasses(theme, {
            light: "bg-gray-200 text-gray-900",
            dark: "bg-gray-600 text-gray-100",
            lightBlue: "bg-blue-200 text-blue-900",
            darkPurple: "bg-purple-700 text-gray-100"
          }) : ""} ${getThemeClasses(theme, {
            light: "text-gray-900 hover:bg-gray-100",
            dark: "text-gray-100 hover:bg-gray-700",
            lightBlue: "text-blue-900 hover:bg-blue-100",
            darkPurple: "text-gray-100 hover:bg-purple-800"
          })}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('light-blue')}
          className={`${theme === 'light-blue' ? getThemeClasses(theme, {
            light: "bg-gray-200 text-gray-900",
            dark: "bg-gray-600 text-gray-100",
            lightBlue: "bg-blue-200 text-blue-900",
            darkPurple: "bg-purple-700 text-gray-100"
          }) : ""} ${getThemeClasses(theme, {
            light: "text-gray-900 hover:bg-gray-100",
            dark: "text-gray-100 hover:bg-gray-700",
            lightBlue: "text-blue-900 hover:bg-blue-100",
            darkPurple: "text-gray-100 hover:bg-purple-800"
          })}`}
        >
          <Palette className="mr-2 h-4 w-4 text-blue-500" />
          <span>Azul Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeTheme('dark-purple')}
          className={`${theme === 'dark-purple' ? getThemeClasses(theme, {
            light: "bg-gray-200 text-gray-900",
            dark: "bg-gray-600 text-gray-100",
            lightBlue: "bg-blue-200 text-blue-900",
            darkPurple: "bg-purple-700 text-gray-100"
          }) : ""} ${getThemeClasses(theme, {
            light: "text-gray-900 hover:bg-gray-100",
            dark: "text-gray-100 hover:bg-gray-700",
            lightBlue: "text-blue-900 hover:bg-blue-100",
            darkPurple: "text-gray-100 hover:bg-purple-800"
          })}`}
        >
          <Palette className="mr-2 h-4 w-4 text-purple-500" />
          <span>Roxo Escuro</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;

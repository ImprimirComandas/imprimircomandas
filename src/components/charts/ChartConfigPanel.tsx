
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  BarChart3, 
  PieChart, 
  AreaChart, 
  History,
  BarChart2,
  PanelLeftOpen,
  Settings,
  Download
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/useTheme';

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'stacked-bar' | 'horizontal-bar';

interface ChartConfigPanelProps {
  onChartTypeChange: (chartType: ChartType) => void;
  onColorSchemeChange?: (scheme: string) => void;
  onPeriodChange?: (period: string) => void;
  onDownloadChart?: () => void;
  defaultChartType?: ChartType;
}

export function ChartConfigPanel({
  onChartTypeChange,
  onColorSchemeChange,
  onPeriodChange,
  onDownloadChart,
  defaultChartType = 'line'
}: ChartConfigPanelProps) {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const { theme } = useTheme();
  
  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
    onChartTypeChange(type);
  };
  
  return (
    <Card className="mb-6 border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Settings className="h-4 w-4 mr-2 text-primary" />
            Configurações do Gráfico
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {onDownloadChart && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onDownloadChart}
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Tipo de Gráfico</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => handleChartTypeChange('line')}
                className={`flex items-center ${chartType === 'line' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <LineChart className="h-4 w-4 mr-1" />
                Linha
              </Button>
              <Button 
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => handleChartTypeChange('bar')}
                className={`flex items-center ${chartType === 'bar' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Barras
              </Button>
              <Button 
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => handleChartTypeChange('area')}
                className={`flex items-center ${chartType === 'area' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <AreaChart className="h-4 w-4 mr-1" />
                Área
              </Button>
              <Button 
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => handleChartTypeChange('pie')}
                className={`flex items-center ${chartType === 'pie' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <PieChart className="h-4 w-4 mr-1" />
                Pizza
              </Button>
              <Button 
                variant={chartType === 'stacked-bar' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => handleChartTypeChange('stacked-bar')}
                className={`flex items-center ${chartType === 'stacked-bar' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <BarChart2 className="h-4 w-4 mr-1" />
                Barras Empilhadas
              </Button>
              <Button 
                variant={chartType === 'horizontal-bar' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => handleChartTypeChange('horizontal-bar')}
                className={`flex items-center ${chartType === 'horizontal-bar' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <PanelLeftOpen className="h-4 w-4 mr-1" />
                Barras Horizontais
              </Button>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Esquema de Cores</p>
            <Select defaultValue="theme" onValueChange={onColorSchemeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Esquema de cores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theme">Tema Atual</SelectItem>
                <SelectItem value="classic">Clássico</SelectItem>
                <SelectItem value="gradient">Gradiente</SelectItem>
                <SelectItem value="vivid">Vibrante</SelectItem>
                <SelectItem value="pastel">Pastel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Período</p>
            <Select defaultValue="today" onValueChange={onPeriodChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

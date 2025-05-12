
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import { MotoboySession } from '../../../../types';
import { useTheme } from '@/hooks/useTheme';

interface SessionControlsProps {
  isActive: boolean;
  sessionId: string;
  onStartSession: () => Promise<void>;
  onEndSession: (sessionId: string) => Promise<void>;
  disabled: boolean;
}

export default function SessionControls({ 
  isActive, 
  sessionId, 
  onStartSession, 
  onEndSession, 
  disabled 
}: SessionControlsProps) {
  const { isDark } = useTheme();
  
  return isActive ? (
    <Button
      onClick={() => onEndSession(sessionId)}
      disabled={disabled}
      variant="destructive"
      size="sm"
      className="w-full mt-3"
    >
      <Square className="h-3.5 w-3.5 mr-1.5" />
      Finalizar Sessão
    </Button>
  ) : (
    <Button
      onClick={onStartSession}
      disabled={disabled}
      variant="outline"
      size="sm"
      className={`w-full mt-3 ${
        isDark 
        ? 'bg-green-950/30 text-green-400 hover:bg-green-900/40 border-green-800/50' 
        : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'
      }`}
    >
      <Play className="h-3.5 w-3.5 mr-1.5" />
      Iniciar Sessão
    </Button>
  );
}


import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square } from 'lucide-react';
import { MotoboySession } from '../../../../types';

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
      className="w-full mt-3 bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
    >
      <Play className="h-3.5 w-3.5 mr-1.5" />
      Iniciar Sessão
    </Button>
  );
}

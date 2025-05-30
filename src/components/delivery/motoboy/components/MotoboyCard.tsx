
import React from 'react';
import { Edit, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { Motoboy, MotoboySession } from '../../../../types';
import { calculateSessionDuration } from '../utils';
import MotoboyEditForm from './MotoboyEditForm';
import DeliveryStats from './DeliveryStats';
import SessionControls from './SessionControls';
import { ClockIcon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface MotoboyCardProps {
  motoboy: Motoboy;
  activeSessions: MotoboySession[];
  onDelete: (id: string) => Promise<void>;
  onSave: (motoboy: Motoboy) => Promise<void>;
  onStartSession: () => Promise<void>;
  onEndSession: (sessionId: string) => Promise<void>;
  sessionLoading: boolean;
  deliveryStats: {
    total: number;
    byNeighborhood: Array<{ bairro: string; count: number; }>;
  };
  loadingStats: boolean;
}

export default function MotoboyCard({
  motoboy,
  activeSessions,
  onDelete,
  onSave,
  onStartSession,
  onEndSession,
  sessionLoading,
  deliveryStats,
  loadingStats,
}: MotoboyCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = React.useState(false);
  const { isDark } = useTheme();
  const isActive = activeSessions.length > 0;

  if (isEditing) {
    return (
      <motion.div
        className={`p-4 rounded-xl border ${
          isActive ? 'border-primary bg-primary/10' : 'border-border bg-card'
        }`}
      >
        <MotoboyEditForm
          motoboy={motoboy}
          onCancel={() => setIsEditing(false)}
          onSave={async (updatedMotoboy) => {
            await onSave(updatedMotoboy);
            setIsEditing(false);
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`p-4 rounded-xl border ${
        isActive ? 'border-primary bg-primary/10' : 'border-border bg-card'
      }`}
    >
      <div className="flex justify-between">
        <h3 className="font-semibold text-foreground">{motoboy.nome}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className={`p-1 rounded-full ${isDark 
              ? 'text-blue-400 hover:bg-blue-900/30' 
              : 'text-blue-600 hover:bg-blue-100'}`}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(motoboy.id)}
            className={`p-1 rounded-full ${
              isDark 
                ? 'text-red-400 hover:bg-red-900/30' 
                : 'text-red-600 hover:bg-red-100'
            }`}
            disabled={isActive}
            title={isActive ? 'Finalize a sessão para excluir' : 'Excluir'}
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {motoboy.telefone && (
        <p className="text-sm text-muted-foreground mt-1">
          Telefone: {motoboy.telefone}
        </p>
      )}

      {isActive && activeSessions[0] && (
        <div className="mt-3">
          <div className="flex items-center text-primary text-sm font-medium mb-2">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>
              Em atividade: {calculateSessionDuration(activeSessions[0].start_time, null)}
            </span>
          </div>

          <DeliveryStats
            stats={deliveryStats}
            isExpanded={isStatsExpanded}
            onToggleExpand={() => setIsStatsExpanded(!isStatsExpanded)}
            isLoading={loadingStats}
          />
        </div>
      )}

      <SessionControls
        isActive={isActive}
        sessionId={activeSessions[0]?.id}
        onStartSession={onStartSession}
        onEndSession={onEndSession}
        disabled={sessionLoading}
      />
    </motion.div>
  );
}


import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { MotoboyCard } from './components/MotoboyCard';
import { MotoboyEditForm } from './components/MotoboyEditForm';
import { SessionSummary } from './SessionSummary';
import type { Motoboy, ExtendedMotoboySession } from '@/types';

interface MotoboyListProps {
  motoboys: Motoboy[];
  activeSessions: ExtendedMotoboySession[];
  onStartSession: (motoboyId: string) => Promise<void>;
  onEndSession: (motoboyId: string) => Promise<void>;
  onEdit: (motoboy: Motoboy) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export function MotoboyList({
  motoboys,
  activeSessions,
  onStartSession,
  onEndSession,
  onEdit,
  onDelete,
  loading
}: MotoboyListProps) {
  const [editingMotoboy, setEditingMotoboy] = useState<Motoboy | null>(null);
  const [showSessionSummary, setShowSessionSummary] = useState<{
    session: ExtendedMotoboySession;
    motoboy: Motoboy;
    entregas: number;
    taxas: number;
  } | null>(null);

  const handleEdit = (motoboy: Motoboy) => {
    setEditingMotoboy(motoboy);
  };

  const handleSaveEdit = async (updatedMotoboy: Motoboy) => {
    await onEdit(updatedMotoboy);
    setEditingMotoboy(null);
  };

  const handleEndSession = async (motoboyId: string) => {
    const session = activeSessions.find(s => s.motoboy_id === motoboyId);
    const motoboy = motoboys.find(m => m.id === motoboyId);
    
    if (session && motoboy) {
      // In a real implementation, you would fetch delivery data from the session
      // For now, using mock data - this should be replaced with actual delivery queries
      const mockEntregas = Math.floor(Math.random() * 10) + 1;
      const mockTaxas = mockEntregas * 5.0; // Mock R$5 per delivery
      
      setShowSessionSummary({
        session,
        motoboy,
        entregas: mockEntregas,
        taxas: mockTaxas
      });
    }
  };

  const handleCloseSummary = async () => {
    if (showSessionSummary) {
      await onEndSession(showSessionSummary.motoboy.id!);
      setShowSessionSummary(null);
    }
  };

  if (editingMotoboy) {
    return (
      <MotoboyEditForm
        motoboy={editingMotoboy}
        onSave={handleSaveEdit}
        onCancel={() => setEditingMotoboy(null)}
        loading={loading}
      />
    );
  }

  if (motoboys.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum motoboy cadastrado ainda.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {motoboys.map(motoboy => {
          const activeSession = activeSessions.find(s => s.motoboy_id === motoboy.id);
          
          return (
            <MotoboyCard
              key={motoboy.id}
              motoboy={motoboy}
              activeSession={activeSession}
              onStartSession={onStartSession}
              onEndSession={() => handleEndSession(motoboy.id!)}
              onEdit={() => handleEdit(motoboy)}
              onDelete={onDelete}
              loading={loading}
            />
          );
        })}
      </div>
      
      {showSessionSummary && (
        <SessionSummary
          session={showSessionSummary.session}
          motoboy={showSessionSummary.motoboy}
          totalEntregas={showSessionSummary.entregas}
          totalTaxasColetadas={showSessionSummary.taxas}
          onClose={handleCloseSummary}
        />
      )}
    </>
  );
}

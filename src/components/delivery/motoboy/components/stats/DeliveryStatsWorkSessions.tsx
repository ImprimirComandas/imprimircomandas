
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Motoboy } from '@/types';

interface ExtendedMotoboySession {
  motoboy_id: string;
  start_time: string;
  end_time: string | null;
  duration?: string;
}

interface DeliveryStatsWorkSessionsProps {
  workSessions: ExtendedMotoboySession[];
  motoboys: Motoboy[];
}

export default function DeliveryStatsWorkSessions({ workSessions, motoboys }: DeliveryStatsWorkSessionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-blue-600" />
        Períodos de Trabalho
      </h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        {workSessions.length > 0 ? (
          <ul className="space-y-4">
            <AnimatePresence>
              {workSessions.map((session, index) => {
                const motoboy = motoboys.find(m => m.id === session.motoboy_id);
                return (
                  <motion.li
                    key={`${session.motoboy_id}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-white rounded-lg shadow-sm"
                  >
                    <div className="font-semibold text-gray-800">{motoboy?.nome || 'Desconhecido'}</div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Início:</span> {new Date(session.start_time).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Fim:</span>{' '}
                      {session.end_time ? new Date(session.end_time).toLocaleString() : 'Em andamento'}
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {session.duration || calculateSessionDuration(session.start_time, session.end_time)}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        ) : (
          <p className="text-gray-600 text-center">Nenhum período de trabalho encontrado</p>
        )}
      </div>
    </motion.div>
  );
}

// Helper function to calculate session duration
function calculateSessionDuration(start: string, end: string | null): string {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

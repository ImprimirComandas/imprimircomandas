import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { calculateSessionDuration, formatDate } from './utils';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '../../ui/table';

interface Motoboy {
  id: string;
  nome: string;
  telefone: string;
  user_id: string;
  created_at: string;
}

interface MotoboySession {
  id: string;
  motoboy_id: string;
  start_time: string;
  end_time: string | null;
  user_id: string;
}

interface SessionHistoryProps {
  sessions: MotoboySession[];
  motoboys: Motoboy[];
}

export default function SessionHistory({ sessions, motoboys }: SessionHistoryProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 text-center text-gray-600">
        Nenhuma sessão registrada.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-xl p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Histórico de Sessões
      </h2>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Motoboy
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Início
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fim
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duração
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.slice(0, 10).map((session) => {
              const motoboy = motoboys.find(m => m.id === session.motoboy_id);
              
              return (
                <TableRow key={session.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {motoboy?.nome || 'Desconhecido'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.start_time ? formatDate(session.start_time) : '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.end_time ? formatDate(session.end_time) : '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.start_time 
                      ? calculateSessionDuration(session.start_time, session.end_time)
                      : '-'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {session.end_time === null ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Ativa
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Finalizada
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
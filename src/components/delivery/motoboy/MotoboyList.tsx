import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Play, Square, Trash, User, X, Save, Clock as ClockIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { calculateSessionDuration, summarizeDeliveries } from './utils';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';

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

interface DeliveryStats {
  bairro: string;
  count: number;
}

interface MotoboyListProps {
  motoboys: Motoboy[];
  sessions: MotoboySession[];
  loading: boolean;
  sessionLoading: boolean;
  onMotoboyDeleted: () => void;
  onSessionStatusChanged: () => void;
}

export default function MotoboyList({
  motoboys,
  sessions,
  loading,
  sessionLoading,
  onMotoboyDeleted,
  onSessionStatusChanged,
}: MotoboyListProps) {
  const [editingMotoboy, setEditingMotoboy] = useState<Motoboy | null>(null);
  const [deliveryStats, setDeliveryStats] = useState<Record<string, { total: number, byNeighborhood: DeliveryStats[] }>>({});
  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [motoboyToDelete, setMotoboyToDelete] = useState<string | null>(null);
  const [isDeletingMotoboy, setIsDeletingMotoboy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveryStats = async () => {
      try {
        const stats: Record<string, { total: number, byNeighborhood: DeliveryStats[] }> = {};
        
        for (const motoboy of motoboys) {
          const activeSession = sessions.find(
            (s) => s.motoboy_id === motoboy.id && s.end_time === null
          );
          
          if (activeSession) {
            setLoadingStats(prev => ({ ...prev, [motoboy.id]: true }));
            
            try {
              // Fetch all entregas for this motoboy during the current session
              const startTime = new Date(activeSession.start_time);
              
              const { data: entregas, error } = await supabase
                .from('entregas')
                .select('bairro')
                .eq('motoboy_id', motoboy.id)
                .gte('created_at', startTime.toISOString());
                
              if (error) throw error;
              
              // Count by neighborhood
              const neighborhoods: Record<string, number> = {};
              let total = 0;
              
              if (entregas && entregas.length > 0) {
                entregas.forEach(entrega => {
                  total++;
                  const bairro = entrega.bairro || 'Não especificado';
                  neighborhoods[bairro] = (neighborhoods[bairro] || 0) + 1;
                });
              }
              
              // Format for display
              const byNeighborhood = Object.entries(neighborhoods).map(([name, count]) => ({
                bairro: name,
                count
              })).sort((a, b) => b.count - a.count);
              
              stats[motoboy.id] = { 
                total, 
                byNeighborhood 
              };
            } catch (error) {
              console.error('Error fetching deliveries for motoboy', motoboy.id, ':', error);
              stats[motoboy.id] = { total: 0, byNeighborhood: [] };
            } finally {
              setLoadingStats(prev => ({ ...prev, [motoboy.id]: false }));
            }
          } else {
            stats[motoboy.id] = { total: 0, byNeighborhood: [] };
          }
        }
        
        setDeliveryStats(stats);
      } catch (error) {
        console.error('Erro ao buscar estatísticas de entregas:', error);
        if (error instanceof Error) {
          toast.error(`Erro ao buscar estatísticas: ${error.message}`);
        } else {
          toast.error('Erro ao buscar estatísticas: Erro desconhecido');
        }
      }
    };

    if (!loading && !sessionLoading && motoboys.length > 0) {
      fetchDeliveryStats();
    }
  }, [motoboys, sessions, loading, sessionLoading]);

  const handleSaveMotoboy = async (motoboy: Motoboy) => {
    try {
      if (motoboy.nome.trim() === '') {
        toast.error('O nome do motoboy não pode estar vazio');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { error } = await supabase
        .from('motoboys')
        .update({
          nome: motoboy.nome,
          telefone: motoboy.telefone,
        })
        .eq('id', motoboy.id);

      if (error) throw error;

      toast.success('Motoboy atualizado com sucesso');
      setEditingMotoboy(null);
      onMotoboyDeleted();
    } catch (error: unknown) {
      console.error('Erro ao atualizar motoboy:', error);
      const err = error as Error;
      toast.error(`Erro ao atualizar motoboy: ${err.message}`);
    }
  };

  const confirmDeleteMotoboy = (id: string) => {
    setMotoboyToDelete(id);
    setDeleteError(null);
    setShowDeleteDialog(true);
  };

  const handleDeleteMotoboy = async () => {
    if (!motoboyToDelete) return;
    
    setIsDeletingMotoboy(true);
    setDeleteError(null);
    
    try {
      const activeSessions = sessions.filter(
        (s) => s.motoboy_id === motoboyToDelete && s.end_time === null
      );

      if (activeSessions.length > 0) {
        toast.error('Finalize a sessão do motoboy antes de excluí-lo');
        setShowDeleteDialog(false);
        setIsDeletingMotoboy(false);
        return;
      }

      // Check if motoboy has any associated deliveries
      const { count, error: countError } = await supabase
        .from('entregas')
        .select('*', { count: 'exact', head: true })
        .eq('motoboy_id', motoboyToDelete);
      
      if (countError) throw countError;
      
      if (count && count > 0) {
        setDeleteError(`Este motoboy tem ${count} entregas associadas. Para excluir, é necessário remover todas as entregas associadas primeiro.`);
        setIsDeletingMotoboy(false);
        return;
      }
      
      const { error } = await supabase
        .from('motoboys')
        .delete()
        .eq('id', motoboyToDelete);

      if (error) throw error;

      toast.success('Motoboy excluído com sucesso');
      setShowDeleteDialog(false);
      onMotoboyDeleted();
    } catch (error: unknown) {
      console.error('Erro ao excluir motoboy:', error);
      const err = error as Error;
      setDeleteError(`Erro ao excluir motoboy: ${err.message}`);
      toast.error(`Erro ao excluir motoboy: ${err.message}`);
    } finally {
      setIsDeletingMotoboy(false);
    }
  };

  const startMotoboySession = async (motoboyId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { data: shopSessions, error: shopSessionsError } = await supabase
        .from('shop_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .is('end_time', null)
        .limit(1);

      if (shopSessionsError) throw shopSessionsError;

      if (!shopSessions || shopSessions.length === 0) {
        toast.error('A loja precisa estar aberta para iniciar uma sessão de motoboy');
        return;
      }

      const { data: existingSessions, error: existingSessionsError } = await supabase
        .from('motoboy_sessions')
        .select('*')
        .eq('motoboy_id', motoboyId)
        .is('end_time', null)
        .limit(1);

      if (existingSessionsError) throw existingSessionsError;

      if (existingSessions && existingSessions.length > 0) {
        toast.error('Este motoboy já possui uma sessão em andamento');
        return;
      }

      const { error } = await supabase
        .from('motoboy_sessions')
        .insert([
          {
            motoboy_id: motoboyId,
            start_time: new Date().toISOString(),
            end_time: null,
            user_id: session.user.id,
          },
        ]);

      if (error) throw error;

      toast.success('Sessão iniciada com sucesso');
      onSessionStatusChanged();
    } catch (error: unknown) {
      console.error('Erro ao iniciar sessão:', error);
      const err = error as Error;
      toast.error(`Erro ao iniciar sessão: ${err.message}`);
    }
  };

  const endMotoboySession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('motoboy_sessions')
        .update({ end_time: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('Sessão finalizada com sucesso');
      onSessionStatusChanged();
    } catch (error: unknown) {
      console.error('Erro ao finalizar sessão:', error);
      const err = error as Error;
      toast.error(`Erro ao finalizar sessão: ${err.message}`);
    }
  };

  const getActiveSessions = (motoboyId: string) => {
    return sessions.filter(
      (session) => session.motoboy_id === motoboyId && session.end_time === null
    );
  };

  const toggleStatsExpansion = (motoboyId: string) => {
    setExpandedStats(prev => ({
      ...prev,
      [motoboyId]: !prev[motoboyId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-blue-600"></div>
      </div>
    );
  }

  if (!motoboys || motoboys.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg font-medium">
          Nenhum motoboy cadastrado. Adicione um motoboy para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {motoboys.map((motoboy) => {
        const activeSessions = getActiveSessions(motoboy.id);
        const isActive = activeSessions.length > 0;
        const stats = deliveryStats[motoboy.id] || { total: 0, byNeighborhood: [] };
        const isStatsExpanded = expandedStats[motoboy.id] || false;
        const isLoadingStats = loadingStats[motoboy.id] || false;

        return (
          <motion.div
            key={motoboy.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl border ${
              isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
          >
            {editingMotoboy?.id === motoboy.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editingMotoboy.nome}
                    onChange={(e) =>
                      setEditingMotoboy({
                        ...editingMotoboy,
                        nome: e.target.value,
                      })
                    }
                    placeholder="Digite o nome do motoboy"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={editingMotoboy.telefone}
                    onChange={(e) =>
                      setEditingMotoboy({
                        ...editingMotoboy,
                        telefone: e.target.value,
                      })
                    }
                    placeholder="Digite o telefone do motoboy"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setEditingMotoboy(null)}
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleSaveMotoboy(editingMotoboy)}
                    className="p-2 rounded-full text-green-600 hover:bg-green-100"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <h3 className="font-semibold text-gray-800">{motoboy.nome}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingMotoboy(motoboy)}
                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDeleteMotoboy(motoboy.id)}
                      className="p-1 rounded-full text-red-600 hover:bg-red-100"
                      disabled={isActive}
                      title={isActive ? 'Finalize a sessão para excluir' : 'Excluir'}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {motoboy.telefone && (
                  <p className="text-sm text-gray-500 mt-1">
                    Telefone: {motoboy.telefone}
                  </p>
                )}

                {isActive && activeSessions[0] && (
                  <div className="mt-3">
                    <div className="flex items-center text-green-600 text-sm font-medium mb-2">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>
                        Em atividade:{' '}
                        {calculateSessionDuration(activeSessions[0].start_time, null)}
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-3 mt-2 border border-green-100">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-800">Resumo de Entregas</h4>
                        <Badge variant="outline" className="bg-green-50">
                          Total: {stats.total}
                        </Badge>
                      </div>
                      
                      {isLoadingStats ? (
                        <div className="flex justify-center py-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                      ) : stats.byNeighborhood.length > 0 ? (
                        <div className="mt-2">
                          <button 
                            onClick={() => toggleStatsExpansion(motoboy.id)}
                            className="text-xs text-blue-600 hover:underline flex items-center"
                          >
                            {isStatsExpanded ? 'Ocultar detalhes' : 'Ver detalhes por bairro'}
                          </button>
                          
                          {isStatsExpanded && (
                            <div className="mt-2 pl-2 border-l-2 border-green-200 space-y-1">
                              {stats.byNeighborhood.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{item.bairro}:</span>
                                  <span className="font-medium">{item.count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : stats.total > 0 ? (
                        <p className="text-xs text-gray-500 mt-1">
                          Entregas sem bairro especificado
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          Nenhuma entrega registrada
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isActive ? (
                  <Button
                    onClick={() => endMotoboySession(activeSessions[0].id)}
                    disabled={sessionLoading}
                    variant="destructive"
                    size="sm"
                    className="w-full mt-3"
                  >
                    <Square className="h-3.5 w-3.5 mr-1.5" />
                    Finalizar Sessão
                  </Button>
                ) : (
                  <Button
                    onClick={() => startMotoboySession(motoboy.id)}
                    disabled={sessionLoading}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    Iniciar Sessão
                  </Button>
                )}
              </>
            )}
          </motion.div>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este motoboy?
            </DialogDescription>
          </DialogHeader>
          
          {deleteError && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-2 text-sm">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-red-700">{deleteError}</span>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeletingMotoboy}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteMotoboy}
              disabled={isDeletingMotoboy || deleteError !== null}
            >
              {isDeletingMotoboy ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

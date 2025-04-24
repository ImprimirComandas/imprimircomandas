
// Export components
export { default as AddMotoboyForm } from './AddMotoboyForm';
export { default as MotoboyList } from './MotoboyList';
export { default as SessionHistory } from './SessionHistory';

// Import types from the global types file
import { Motoboy, MotoboySession } from '../../../types';

// Re-export the types
export type { Motoboy, MotoboySession };

// Define local props interfaces that are used by these components
export interface AddMotoboyFormProps {
  onSubmit: (nome: string, telefone: string) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export interface MotoboyListProps {
  motoboys: Motoboy[];
  sessions: MotoboySession[];
  loading: boolean;
  sessionLoading?: boolean;
  onMotoboyDeleted: () => void;
  onSessionAdded: () => void;
  onSessionEnded: () => void;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
}

export interface SessionHistoryProps {
  sessions: MotoboySession[];
  motoboys: Motoboy[];
  onRefresh?: () => void;
}

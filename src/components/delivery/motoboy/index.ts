
// Export components
export { default as AddMotoboyForm } from './AddMotoboyForm';
export { default as MotoboyList } from './MotoboyList';
export { default as SessionHistory } from './SessionHistory';

// Import types from the central types file and re-export them
import type { Motoboy as AppMotoboy, MotoboySession as AppMotoboySession } from '../../../types';

// Re-export the types with consistent interfaces
export type Motoboy = AppMotoboy;
export type MotoboySession = AppMotoboySession;

// Define the props for AddMotoboyForm
export interface AddMotoboyFormProps {
  onMotoboyAdded: () => void;
  onCancel: () => void;
  onSubmit?: (nome: string, telefone: string, plate: string, vehicleType: string) => Promise<void>;
  loading?: boolean;
}

// Define props for MotoboyList
export interface MotoboyListProps {
  motoboys: Motoboy[];
  sessions: MotoboySession[];
  loading: boolean;
  sessionLoading?: boolean;
  onMotoboyDeleted: () => Promise<void>;
  onSessionStatusChanged: () => Promise<void>;
  onSessionAdded?: () => void;
  onSessionEnded?: () => void;
  onToggleStatus?: (id: string, currentStatus: string) => Promise<void>;
}

// Define props for SessionHistory
export interface SessionHistoryProps {
  sessions: MotoboySession[];
  motoboys: Motoboy[];
  onRefresh?: () => void;
}

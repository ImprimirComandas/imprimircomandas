
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // For now, just return the children - you can add authentication logic here later
  return <>{children}</>;
}

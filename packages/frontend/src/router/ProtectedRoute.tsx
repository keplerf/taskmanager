import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated, checkAndRestoreSession } = useAuthStore();

  useEffect(() => {
    // Check and restore session on mount
    checkAndRestoreSession();
    setIsChecking(false);
  }, [checkAndRestoreSession]);

  // Show nothing while checking session
  if (isChecking) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

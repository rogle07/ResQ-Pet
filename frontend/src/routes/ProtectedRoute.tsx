import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import type { UserRole } from '@/types';
import { roleHomePath } from '@/routes/roleHomePath';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, status } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

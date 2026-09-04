import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

// Guards any route that requires a logged-in user. While the /profile
// check is in flight we render nothing rather than briefly showing a
// login screen that then flashes to the real content once auth resolves.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

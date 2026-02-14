import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/session";
import { PATHS } from "@/shared/config";

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={PATHS.login} replace />;
  return children;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "../model/AuthContext";
import { PATHS } from "../../../../app/router/paths";

export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to={PATHS.login} replace />;
  return children;
}

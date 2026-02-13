import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/session/model/AuthContext";
import { PATHS } from "../../../app/router/paths";

export default function RequireRole({ allow = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={PATHS.login} replace />;
  if (allow.length && !allow.includes(user.role)) return <Navigate to={PATHS.dashboard} replace />;
  return children;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/session/model/AuthContext";
import { PATHS } from "../../../app/router/paths";

export default function RequirePermission({ allow = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={PATHS.login} replace />;
  const perms = new Set(user.permissions || []);
  if (allow.length && !allow.every((p) => perms.has(p))) return <Navigate to={PATHS.dashboard} replace />;
  return children;
}

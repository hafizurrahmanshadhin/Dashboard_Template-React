import React from "react";
import { AuthProvider } from "../../features/auth/session/model/AuthContext";

export function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

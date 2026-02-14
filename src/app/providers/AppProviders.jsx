import { AuthProvider } from "@/features/auth/session";

export function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

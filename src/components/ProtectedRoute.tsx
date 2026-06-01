import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isDemoMode } from "../lib/appMode";
import { useAuth } from "../lib/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (isDemoMode()) return <>{children}</>;

  // loading kabhi true nahi hoga ab
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50" />
  );

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

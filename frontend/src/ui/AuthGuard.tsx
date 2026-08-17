import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export function AuthGuard({ children, role }: { children: ReactNode; role?: string }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="nx-page flex items-center justify-center">
        <p style={{ color: "var(--muted)", animation: "nxPulse 1.5s infinite" }}>Initializing...</p>
      </div>
    );
  }

  if (!user?.authenticated) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role && user.role !== "admin") {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}

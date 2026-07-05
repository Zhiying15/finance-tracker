import { Navigate, Outlet } from "react-router";
import { useAuth } from "@store/AuthContext";

/**
 * Wraps any route that requires authentication.
 * Shows a spinner while the initial /me check is in-flight,
 * then redirects to /login if no session exists.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading session…</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
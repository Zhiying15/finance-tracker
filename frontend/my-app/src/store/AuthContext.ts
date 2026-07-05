import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "@api/index";
import type { Api } from "@api/index";

// ─── Local type aliases ───────────────────────────────────────────────────────

type AuthUser       = Api.Auth.UserResponse;
type LoginRequest   = Api.Auth.LoginRequest;
type RegisterRequest = Api.Auth.RegisterRequest;

// ─── Context value shape ──────────────────────────────────────────────────────

interface AuthContextValue {
  // State
  user:            AuthUser | null;
  isLoading:       boolean;   // true while GET /auth/me is in-flight on mount
  isAuthenticated: boolean;   // shorthand for user !== null

  // Actions — each maps 1:1 to an authApi call
  login:    (body: LoginRequest)    => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout:   ()                      => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
//
// Wrap the entire app in <AuthProvider> (done in App.tsx).
//
// On mount it calls GET /auth/me to restore the session from the HttpOnly
// cookie that Spring Session set on the last successful login. While that
// request is in-flight, isLoading = true — ProtectedRoute shows a spinner
// instead of redirecting to /login prematurely.
//
// Session lifecycle:
//   register → auto-login (register does NOT start a session in the backend)
//   login    → backend sets HttpOnly cookie → /me returns the user
//   logout   → backend invalidates the cookie → user set to null → redirect

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);

  // ── Restore session on app load ────────────────────────────────────────────
  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null)) // 401 = no active session — not an error
      .finally(() => setLoading(false));
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (body: LoginRequest): Promise<void> => {
    const loggedIn = await authApi.login(body);
    setUser(loggedIn);
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  // Backend POST /auth/register creates the user but does NOT start a session.
  // We immediately call login so the user lands on the dashboard authenticated.
  const register = useCallback(async (body: RegisterRequest): Promise<void> => {
    await authApi.register(body);
    const loggedIn = await authApi.login({
      email:    body.email,
      password: body.password,
    });
    setUser(loggedIn);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    await authApi.logout();
    setUser(null);
    // Navigation to /login is handled by the caller (Sidebar) so the
    // router controls the redirect, not the context.
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── useAuth hook ─────────────────────────────────────────────────────────────
//
// Usage in any component inside <AuthProvider>:
//
//   const { user, isAuthenticated, login, logout } = useAuth();
//
// Throws if called outside <AuthProvider> — fail-fast for wiring mistakes.

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
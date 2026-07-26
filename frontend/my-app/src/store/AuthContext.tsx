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

// ─── Context value shape ──────────────────────────────────────────────────────

interface AuthContextValue {
  user:            Api.Auth.UserResponse | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  login:    (body: Api.Auth.LoginRequest)    => Promise<void>;
  register: (body: Api.Auth.RegisterRequest) => Promise<void>;
  logout:   ()                           => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<Api.Auth.UserResponse | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (body: Api.Auth.LoginRequest): Promise<void> => {
    const loggedIn = await authApi.login(body);
    setUser(loggedIn);
  }, []);

  const register = useCallback(async (body: Api.Auth.RegisterRequest): Promise<void> => {
    await authApi.register(body);
    const loggedIn = await authApi.login({ email: body.email, password: body.password });
    setUser(loggedIn);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── useAuth hook ─────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
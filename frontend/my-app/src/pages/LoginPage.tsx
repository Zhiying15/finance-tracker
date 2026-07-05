import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@store/AuthContext";
import type { AxiosError } from "axios";
import type { Api } from "@api/index";
type ApiError = Api.ErrorResponse;

type Tab = "login" | "register";

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate             = useNavigate();
  const [tab, setTab]        = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // ── Login form state
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ── Register form state
  const [regName, setRegName]         = useState("");
  const [regEmail, setRegEmail]       = useState("");
  const [regPassword, setRegPassword] = useState("");

  function extractError(err: unknown): string {
    const axiosErr = err as AxiosError<ApiError>;
    return (
      axiosErr.response?.data?.message ??
      axiosErr.message ??
      "An unexpected error occurred"
    );
  }

  async function handleLogin() {
    if (!loginEmail || !loginPassword) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login({ email: loginEmail, password: loginPassword });
      navigate("/", { replace: true });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!regName || !regEmail || !regPassword) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({ fullName: regName, email: regEmail, password: regPassword });
      navigate("/", { replace: true });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-2xl font-bold text-indigo-400">
            ₣
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            FinTrack
          </h1>
          <p className="mt-1 text-sm text-slate-500">Personal Finance Tracker</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-sm">
          {/* Tab switcher */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-1"
          >
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => { setTab(t); setError(null); }}
                className={`rounded-lg py-2 text-sm font-semibold capitalize transition-all duration-200 ${
                  tab === t
                    ? "bg-indigo-500 text-white shadow"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"
            >
              {error}
            </div>
          )}

          {/* Login form */}
          {tab === "login" && (
            <div className="space-y-4">
              <Field label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={inputCls}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className={inputCls}
                />
              </Field>
              <button
                type="button"
                disabled={loading}
                onClick={handleLogin}
                className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </div>
          )}

          {/* Register form */}
          {tab === "register" && (
            <div className="space-y-4">
              <Field label="Full Name">
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <button
                type="button"
                disabled={loading}
                onClick={handleRegister}
                className="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
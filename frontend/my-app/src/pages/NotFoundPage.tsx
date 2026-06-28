import { Link, useLocation } from "react-router";

export function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
      {/* Glowing 404 */}
      <div className="relative">
        <p
          aria-hidden="true"
          className="select-none text-[120px] font-black leading-none tracking-tighter text-white/[0.03]"
        >
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 text-4xl">
            🗺
          </div>
        </div>
      </div>

      <h1 className="mt-6 text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-400">
        <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-slate-300">
          {pathname}
        </code>{" "}
        doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
        >
          ← Back to Dashboard
        </Link>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
        >
          View Transactions
        </Link>
      </div>
    </div>
  );
}

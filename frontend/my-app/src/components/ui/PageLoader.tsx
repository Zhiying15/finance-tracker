interface PageLoaderProps {
  loading: boolean;
  error:   string | null;
  onRetry?: () => void;
}

export function PageLoader({ loading, error, onRetry }: PageLoaderProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center" aria-live="polite" aria-label="Loading">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
        <p className="text-2xl" aria-hidden="true">⚠</p>
        <div>
          <p className="font-semibold text-rose-400">Failed to load data</p>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
        </div>
        {onRetry && (
          <button type="button" onClick={onRetry}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
            Try again
          </button>
        )}
      </div>
    );
  }

  return null;
}
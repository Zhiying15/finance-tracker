import { Component, type ReactNode, type ErrorInfo } from "react";
import { Link } from "react-router";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: send to error reporting service (Sentry, etc.)
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-3xl">
            ⚠
          </div>
          <h1 className="mt-6 text-2xl font-bold text-white">Something went wrong</h1>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            An unexpected error occurred. The error has been logged.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-w-xl overflow-auto rounded-xl border border-white/5 bg-slate-900 p-4 text-left font-mono text-xs text-rose-400">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Try again
            </button>
            <Link
              to="/"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

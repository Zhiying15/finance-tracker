import { useState, useEffect, useCallback, useRef } from "react";

export interface AsyncState<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
  reload:  () => void;
}

/**
 * Runs an async function, tracks loading/error/data state, and exposes a
 * `reload` callback. Re-runs when any dep changes. Ignores stale responses
 * via AbortController.
 */
export function useAsync<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fnRef.current(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, reload };
}
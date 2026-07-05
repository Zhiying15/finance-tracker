import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import type { Api } from "@type/index";

// =============================================================================
// INTERCEPTORS
//
// Attach to any Axios instance via attachInterceptors(instance).
// Used by both client and uploadClient in client.ts.
//
// Interceptor execution order:
//   Request:  requestLogger → (axios sends request)
//   Response: responseLogger → errorHandler
// =============================================================================

// ─── Config ───────────────────────────────────────────────────────────────────

const IS_DEV = import.meta.env.DEV;

// =============================================================================
// REQUEST INTERCEPTORS
// =============================================================================

/**
 * Logs outgoing requests in development.
 * Strips sensitive headers before logging.
 */
function requestLogger(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (IS_DEV) {
    console.debug(
      `[API →] ${config.method?.toUpperCase()} ${config.baseURL ?? ""}${config.url ?? ""}`,
      ...(config.params ? ["params:", config.params] : []),
      ...(config.data   ? ["body:",   config.data]   : []),
    );
  }
  return config;
}

function requestLoggerError(error: unknown): Promise<never> {
  return Promise.reject(error);
}

// =============================================================================
// RESPONSE INTERCEPTORS
// =============================================================================

/**
 * Logs successful responses in development.
 */
function responseLogger(response: AxiosResponse): AxiosResponse {
  if (IS_DEV) {
    console.debug(
      `[API ←] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url ?? ""}`,
    );
  }
  return response;
}

/**
 * Normalises all API errors into a consistent shape.
 *
 * Handles:
 *   401 Unauthorized  — session expired, redirect to /login
 *   403 Forbidden     — user lacks permission, warn without redirect
 *   404 Not Found     — resource gone, warn
 *   422 Unprocessable — validation error from Spring, surface message
 *   5xx Server Error  — backend fault, warn
 *   Network error     — no response at all (CORS, server down)
 */
function errorHandler(error: AxiosError<Api.ErrorResponse>): Promise<never> {
  const { response, request, config } = error;
  const url = `${config?.method?.toUpperCase() ?? "?"} ${config?.url ?? "?"}`;

  if (response) {
    const { status, data } = response;
    const serverMessage = data?.message ?? error.message;

    switch (true) {
      case status === 401:
        // Session expired or unauthenticated — redirect to login
        // Guard against infinite redirect loop if already on /login
        if (!window.location.pathname.startsWith("/login")) {
          if (IS_DEV) console.warn(`[API 401] Session expired — redirecting to /login`);
          window.location.href = "/login";
        }
        break;

      case status === 403:
        console.warn(`[API 403] Forbidden: ${url} — ${serverMessage}`);
        break;

      case status === 404:
        console.warn(`[API 404] Not found: ${url}`);
        break;

      case status === 422:
        // Spring validation error — message contains field-level detail
        console.warn(`[API 422] Validation error: ${url} — ${serverMessage}`);
        break;

      case status >= 500:
        console.error(`[API ${status}] Server error: ${url} — ${serverMessage}`);
        break;

      default:
        if (IS_DEV) console.warn(`[API ${status}] ${url} — ${serverMessage}`);
    }

    // Attach a normalised message to the error so callers can do:
    // catch (e) { showToast(normaliseError(e)) }
    error.message = serverMessage;

  } else if (request) {
    // Request was sent but no response received — server down or CORS
    console.error(`[API] No response received for ${url} — server may be down or CORS blocked`);
    error.message = "No response from server. Please check your connection.";

  } else {
    // Error setting up the request itself
    console.error(`[API] Request setup failed: ${error.message}`);
  }

  return Promise.reject(error);
}

// =============================================================================
// ATTACH — call once per Axios instance
// =============================================================================

/**
 * Attaches all request and response interceptors to an Axios instance.
 * Call this in client.ts for both `client` and `uploadClient`.
 *
 * Returns ejector functions so interceptors can be removed in tests.
 */
export function attachInterceptors(instance: AxiosInstance): {
  ejectRequest:  number;
  ejectResponse: number;
} {
  const ejectRequest = instance.interceptors.request.use(
    requestLogger,
    requestLoggerError,
  );

  const ejectResponse = instance.interceptors.response.use(
    responseLogger,
    errorHandler,
  );

  return { ejectRequest, ejectResponse };
}

// =============================================================================
// HELPERS — exported for use in components / hooks
// =============================================================================

/**
 * Extracts a human-readable message from any caught error.
 * Use this in catch blocks to show toast notifications or inline errors.
 *
 * @example
 * try {
 *   await transactionsApi.create(body)
 * } catch (err) {
 *   setError(normaliseError(err))
 * }
 */
export function normaliseError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

/**
 * Type guard — narrows unknown to AxiosError<Api.ErrorResponse>.
 * Use before accessing .response?.data?.message directly.
 *
 * @example
 * if (isApiError(err) && err.response?.status === 422) {
 *   setFieldError(err.response.data.message)
 * }
 */
export function isApiError(error: unknown): error is AxiosError<Api.ErrorResponse> {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}
// =============================================================================
// ENDPOINTS — Single source of truth for all backend API paths
//
// Rules:
//   • Static paths are plain strings: ENDPOINTS.AUTH.LOGIN → "/auth/login"
//   • Dynamic paths are arrow functions: ENDPOINTS.ACCOUNTS.BY_ID(42) → "/accounts/42"
//   • Every api/*.ts file imports from here — no raw strings in api calls
//   • Base URL lives in api/client.ts (VITE_API_URL). These are path suffixes only.
// =============================================================================

export const ENDPOINTS = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN:    "/auth/login",
    ME:       "/auth/me",
    LOGOUT:   "/auth/logout",
  },

  // ── Data Dictionary ──────────────────────────────────────────────────────────
  DATA_DICTIONARY: {
    ALL:        "/data-dictionary",
    GROUP:      (groupCode: string) => `/data-dictionary/${groupCode}`,
  },

  // ── Accounts ─────────────────────────────────────────────────────────────────
  ACCOUNTS: {
    TYPES:      "/accounts/types",
    LIST:       "/accounts",
    NET_WORTH:  "/accounts/net-worth",
    BY_ID:      (accountId: number) => `/accounts/${accountId}`,
    REACTIVATE: (accountId: number) => `/accounts/${accountId}/reactivate`,
  },

  // ── Transactions ─────────────────────────────────────────────────────────────
  TRANSACTIONS: {
    LIST:       "/transactions",
    BY_PERIOD:  "/transactions/by-period",
    BY_ACCOUNT: (accountId: number) => `/transactions/by-account/${accountId}`,
    SUMMARY:    "/transactions/summary",
    BY_ID:      (transactionId: number) => `/transactions/${transactionId}`,
    CREATE:     "/transactions",
  },

  // ── Budget ───────────────────────────────────────────────────────────────────
  BUDGET: {
    SUMMARY: "/budget",
    HISTORY: "/budget/history",
    UPSERT:  "/budget",
    DELETE:  "/budget",
  },

  // ── Import ───────────────────────────────────────────────────────────────────
  IMPORT: {
    UPLOAD:       "/import/upload",
    FILES:        "/import/files",
    FILE_BY_ID:   (fileId: number) => `/import/files/${fileId}`,
    ROWS:         (fileId: number) => `/import/files/${fileId}/rows`,
    ROW_BY_ID:    (fileId: number, importTxId: number) => `/import/files/${fileId}/rows/${importTxId}`,
    APPROVE_ROW:  (fileId: number, importTxId: number) => `/import/files/${fileId}/rows/${importTxId}/approve`,
    REJECT_ROW:   (fileId: number, importTxId: number) => `/import/files/${fileId}/rows/${importTxId}/reject`,
    BULK_APPROVE: (fileId: number) => `/import/files/${fileId}/bulk-approve`,
    BULK_REJECT:  (fileId: number) => `/import/files/${fileId}/bulk-reject`,
  },

  // ── Exchange Rates ───────────────────────────────────────────────────────────
  EXCHANGE_RATES: {
    ALL:     "/exchange-rates",
    BY_CODE: (currencyCode: string) => `/exchange-rates/${currencyCode.toUpperCase()}`,
    REFRESH: "/exchange-rates/refresh",
  },
} as const;

// =============================================================================
// Type helpers — derive path types from the ENDPOINTS object
// =============================================================================

/** All static (non-function) endpoint paths as a union type */
type LeafStrings<T> = T extends string
  ? T
  : T extends (...args: never[]) => string
  ? never
  : T extends object
  ? { [K in keyof T]: LeafStrings<T[K]> }[keyof T]
  : never;

export type StaticEndpoint = LeafStrings<typeof ENDPOINTS>;
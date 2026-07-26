// =============================================================================
// API INDEX — Request bodies, response bodies, query params, module exports
//
// All backend-facing types are grouped in the Api namespace by domain.
// Import via: import type { Api } from "@api/index"
// =============================================================================

// ─── Re-export modules ────────────────────────────────────────────────────────
export { ENDPOINTS }                              from "./endpoints";
export type { StaticEndpoint }                    from "./endpoints";
export { client, uploadClient }                   from "./client";
export { attachInterceptors, normaliseError, isApiError } from "./interceptors";
export { authApi }                                from "./auth";
export { dataDictionaryApi, DD_GROUPS }           from "./dataDictionary";
export { accountsApi }                            from "./accounts";
export { transactionsApi }                        from "./transactions";
export { budgetApi }                              from "./budget";
export { importApi }                              from "./import";
export { exchangeRatesApi }                       from "./exchangeRates";

// ─── Shared enums — top-level for direct import ───────────────────────────────
export type TransactionFlow    = "INFLOW" | "OUTFLOW" | "TRANSFER";
export type BudgetType         = "INCOME" | "NEED" | "WANT" | "SAVINGS";
export type AssetClass         = "CASH" | "FIXED_INCOME" | "EQUITY" | "REAL_ESTATE" | "COMMODITY" | "CRYPTO" | "OTHER";
export type AccountCategory    = "ASSET" | "LIABILITY";
export type ImportReviewStatus = "NEW" | "APPROVED" | "REJECTED" | "ERROR";
export type ImportedFileStatus = "UPLOADED" | "PROCESSING" | "PENDING_REVIEW" | "COMPLETED" | "FAILED";

// =============================================================================
// Api namespace — typed contracts for every endpoint
// =============================================================================

export namespace Api {

  // ── Auth ────────────────────────────────────────────────────────────────────
  export namespace Auth {
    export interface RegisterRequest { email: string; password: string; fullName: string; }
    export interface LoginRequest    { email: string; password: string; }
    export interface UserResponse    { id: number; email: string; fullName: string; createdAt: string; }
    export type     LogoutResponse   = void;
  }

  // ── Data Dictionary ─────────────────────────────────────────────────────────
  export namespace DataDictionary {
    export interface Item  { code: string; label: string; description?: string; sortOrder?: number; }
    export interface Group { groupCode: string; items: Item[]; }
    export type GroupCode =
      | "BUDGET_TYPE" | "TRANSACTION_FLOW" | "ASSET_CLASS"
      | "ACCOUNT_CATEGORY" | "IMPORT_REVIEW_STATUS" | "IMPORTED_FILE_STATUS";
  }

  // ── Accounts ────────────────────────────────────────────────────────────────
  export namespace Accounts {
    export interface AccountType {
      id: number; name: string; assetClass: AssetClass;
      accountCategory: AccountCategory; description?: string;
    }
    export interface Account {
      id: number; accountTypeId: number; accountType?: AccountType;
      name: string; institution?: string; accountNumber?: string;
      currencyCode: string; openingBalance: number; currentBalance: number;
      manualValuation: boolean; manualBalance?: number; lastValuationDate?: string;
      includeInNetWorth: boolean; isActive: boolean; notes?: string;
      createdAt: string; updatedAt: string;
    }
    export interface ListParams           { includeInactive?: boolean; }
    export interface CreateRequest        { accountTypeId: number; name: string; institution?: string; accountNumber?: string; currencyCode: string; openingBalance: number; manualValuation?: boolean; lastValuationDate?: string; includeInNetWorth?: boolean; notes?: string; }
    export interface UpdateRequest        { name?: string; institution?: string; accountNumber?: string; includeInNetWorth?: boolean; notes?: string; }
    export interface UpdateValuationRequest { manualBalance: number; lastValuationDate: string; }
    export interface NetWorthResponse     { totalAssets: number; totalLiabilities: number; netWorth: number; currencyCode: string; asOf: string; }
    export type DeactivateResponse  = void;
    export type ReactivateResponse  = Account;
  }

  // ── Transactions ────────────────────────────────────────────────────────────
  export namespace Transactions {
    export interface PeriodParams  { year: number; month: number; }
    export interface AccountRef    { id: number; name: string; currencyCode: string; }
    export interface Transaction {
      id: number; fromAccountId?: number; fromAccount?: AccountRef;
      toAccountId?: number; toAccount?: AccountRef;
      transactionFlow: TransactionFlow; transactionDate: string;
      description: string; amount: number; currencyCode: string;
      exchangeRate: number; amountSgd: number; budgetType?: BudgetType;
      isRecurring: boolean; remarks?: string; importTxId?: number;
      createdAt: string; updatedAt: string;
    }
    export interface CreateRequest {
      fromAccountId?: number; toAccountId?: number;
      transactionFlow: TransactionFlow; transactionDate: string;
      description: string; amount: number; currencyCode: string;
      exchangeRate: number; budgetType?: BudgetType;
      isRecurring?: boolean; remarks?: string;
    }
    export interface UpdateRequest { description?: string; budgetType?: BudgetType; remarks?: string; transactionDate?: string; amount?: number; }
    export interface MonthlySummaryResponse {
      year: number; month: number;
      totalInflow: number; totalOutflow: number; totalTransfer: number; netFlow: number;
      byBudgetType: Partial<Record<BudgetType, number>>;
    }
    export type DeleteResponse = void;
  }

  // ── Budget ──────────────────────────────────────────────────────────────────
  export namespace Budget {
    export interface QueryParams  { year: number; month: number; }
    export interface Config       { id?: number; year: number; month: number; needPercent: number; wantPercent: number; savingsPercent: number; declaredIncome?: number; }
    export interface SummaryResponse {
      config: Config; actualIncome: number; effectiveIncome: number;
      needTarget: number; wantTarget: number; savingsTarget: number;
      needActual: number; wantActual: number; savingsActual: number; spareCash: number;
    }
    export type HistoryResponse = Config[];
    export interface UpsertRequest { year: number; month: number; needPercent?: number; wantPercent?: number; savingsPercent?: number; declaredIncome?: number; }
    export type DeleteResponse = void;
  }

  // ── Import ──────────────────────────────────────────────────────────────────
  export namespace Import {
    export interface UploadParams      { accountId: number; }
    export interface ApproveRowParams  { accountId: number; }
    export interface BulkApproveParams { accountId: number; }
    export interface ImportedFile {
      id: number; filename: string; status: ImportedFileStatus;
      accountId?: number; account?: { id: number; name: string };
      totalRows: number; approvedRows: number; rejectedRows: number; pendingRows: number;
      uploadedAt: string; processedAt?: string; errorMessage?: string;
    }
    export interface ImportRow {
      id: number; fileId: number; transactionDate: string; description: string;
      amount: number; isInflow: boolean; currency: string;
      budgetType?: BudgetType; status: ImportReviewStatus;
      errorMessage?: string; createdTransactionId?: number;
    }
    export interface UpdateRowRequest  { transactionDate?: string; description?: string; amount?: number; isInflow?: boolean; currency?: string; budgetType?: BudgetType; }
  }

  // ── Exchange Rates ───────────────────────────────────────────────────────────
  export namespace ExchangeRates {
    export interface Rate { currencyCode: string; rateToSgd: number; updatedAt: string; }
    export type RefreshResponse = void;
  }

  // ── Shared ──────────────────────────────────────────────────────────────────
  export interface ErrorResponse { status: number; error: string; message: string; timestamp: string; path: string; }
  export interface Page<T>       { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
}
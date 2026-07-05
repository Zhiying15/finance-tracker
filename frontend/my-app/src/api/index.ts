// =============================================================================
// API INDEX — Request bodies, response bodies, query params, and module exports
//
// This file is the single contract layer between frontend and backend.
// Every type here maps 1:1 to an actual backend endpoint from the cURL spec.
//
// Structure:
//   namespace Auth            — /api/auth/*
//   namespace DataDictionary  — /api/data-dictionary/*
//   namespace Accounts        — /api/accounts/*
//   namespace Transactions    — /api/transactions/*
//   namespace Budget          — /api/budget/*
//   namespace Import          — /api/import/*
//   namespace ExchangeRates   — /api/exchange-rates/*
//
// Usage:
//   import { Api } from "@api/index"
//   const body: Api.Auth.LoginRequest = { email, password }
//   const user: Api.Auth.UserResponse = await authApi.login(body)
// =============================================================================

// ─── Re-export domain modules ─────────────────────────────────────────────────
export { ENDPOINTS }                    from "./endpoints";
export type { StaticEndpoint }          from "./endpoints";
export { client, uploadClient }                   from "./client";
export { attachInterceptors, normaliseError, isApiError } from "./interceptors";
export { authApi }                      from "./auth";
export { dataDictionaryApi, DD_GROUPS } from "./dataDictionary";
export { accountsApi }                  from "./accounts";
export { transactionsApi }              from "./transactions";
export { budgetApi }                    from "./budget";
export { importApi }                    from "./import";
export { exchangeRatesApi }             from "./exchangeRates";

// ===========================================================================
  // SHARED ENUMS  — mirror backend uppercase values exactly
  // ===========================================================================

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

  // ===========================================================================
  // AUTH  —  /api/auth/*
  // ===========================================================================
  export namespace Auth {

    // POST /api/auth/register
    export interface RegisterRequest {
      email:    string;
      password: string;
      fullName: string;
    }

    // POST /api/auth/login
    export interface LoginRequest {
      email:    string;
      password: string;
    }

    // POST /api/auth/register  →  201
    // POST /api/auth/login     →  200
    // GET  /api/auth/me        →  200
    export interface UserResponse {
      id:        number;
      email:     string;
      fullName:  string;
      createdAt: string;
    }

    // POST /api/auth/logout  →  204 (no body)
    export type LogoutResponse = void;
  }

  // ===========================================================================
  // DATA DICTIONARY  —  /api/data-dictionary/*
  // ===========================================================================
  export namespace DataDictionary {

    // Seeded at startup — read-only from frontend
    export interface Item {
      code:        string;
      label:       string;
      description?: string;
      sortOrder?:  number;
    }

    // GET /api/data-dictionary          →  Group[]
    // GET /api/data-dictionary/:code    →  Group
    export interface Group {
      groupCode: string;
      items:     Item[];
    }

    // Valid groupCode values
    export type GroupCode =
      | "BUDGET_TYPE"
      | "TRANSACTION_FLOW"
      | "ASSET_CLASS"
      | "ACCOUNT_CATEGORY"
      | "IMPORT_REVIEW_STATUS"
      | "IMPORTED_FILE_STATUS";
  }

  // ===========================================================================
  // ACCOUNTS  —  /api/accounts/*
  // ===========================================================================
  export namespace Accounts {

    // GET /api/accounts/types  →  AccountType[]
    export interface AccountType {
      id:              number;
      name:            string;
      assetClass:      AssetClass;
      accountCategory: AccountCategory;
      description?:    string;
    }

    // GET  /api/accounts          →  Account[]
    // GET  /api/accounts/:id      →  Account
    // POST /api/accounts          →  Account
    // PATCH /api/accounts/:id     →  Account
    export interface Account {
      id:                number;
      accountTypeId:     number;
      accountType?:      AccountType;
      name:              string;
      institution?:      string;
      accountNumber?:    string;
      currencyCode:      string;
      openingBalance:    number;
      currentBalance:    number;
      manualValuation:   boolean;
      manualBalance?:    number;
      lastValuationDate?: string;       // ISO date "YYYY-MM-DD"
      includeInNetWorth: boolean;
      isActive:          boolean;
      notes?:            string;
      createdAt:         string;
      updatedAt:         string;
    }

    // GET /api/accounts?includeInactive=true
    export interface ListParams {
      includeInactive?: boolean;
    }

    // POST /api/accounts
    export interface CreateRequest {
      accountTypeId:     number;
      name:              string;
      institution?:      string;
      accountNumber?:    string;
      currencyCode:      string;
      openingBalance:    number;
      manualValuation?:  boolean;
      lastValuationDate?: string;
      includeInNetWorth?: boolean;
      notes?:            string;
    }

    // PATCH /api/accounts/:id  (general update)
    export interface UpdateRequest {
      name?:             string;
      institution?:      string;
      accountNumber?:    string;
      includeInNetWorth?: boolean;
      notes?:            string;
    }

    // PATCH /api/accounts/:id  (manual valuation update)
    export interface UpdateValuationRequest {
      manualBalance:     number;
      lastValuationDate: string;         // ISO date "YYYY-MM-DD"
    }

    // GET /api/accounts/net-worth
    export interface NetWorthResponse {
      totalAssets:      number;
      totalLiabilities: number;
      netWorth:         number;
      currencyCode:     string;
      asOf:             string;
    }

    // DELETE /api/accounts/:id     →  204 (soft delete / deactivate)
    // PATCH  /api/accounts/:id/reactivate  →  Account
    export type DeactivateResponse  = void;
    export type ReactivateResponse  = Account;
  }

  // ===========================================================================
  // TRANSACTIONS  —  /api/transactions/*
  // ===========================================================================
  export namespace Transactions {

    // GET /api/transactions/by-period?year=2025&month=6
    // GET /api/transactions/summary?year=2025&month=6
    export interface PeriodParams {
      year:  number;
      month: number;   // 1–12
    }

    // GET  /api/transactions              →  Transaction[]
    // GET  /api/transactions/by-period    →  Transaction[]
    // GET  /api/transactions/by-account/:id  →  Transaction[]
    // GET  /api/transactions/:id          →  Transaction
    // POST /api/transactions              →  Transaction
    // PATCH /api/transactions/:id         →  Transaction
    export interface Transaction {
      id:              number;
      fromAccountId?:  number;
      fromAccount?:    AccountRef;
      toAccountId?:    number;
      toAccount?:      AccountRef;
      transactionFlow: TransactionFlow;
      transactionDate: string;           // ISO date "YYYY-MM-DD"
      description:     string;
      amount:          number;           // original currency amount
      currencyCode:    string;
      exchangeRate:    number;           // rate to SGD
      amountSgd:       number;           // amount × exchangeRate
      budgetType?:     BudgetType;       // null for TRANSFER
      isRecurring:     boolean;
      remarks?:        string;
      importTxId?:     number;           // set if created via import
      createdAt:       string;
      updatedAt:       string;
    }

    // Lightweight account ref embedded in Transaction
    export interface AccountRef {
      id:           number;
      name:         string;
      currencyCode: string;
    }

    // POST /api/transactions
    // Rules enforced by backend:
    //   INFLOW   → toAccountId required,   budgetType = INCOME recommended
    //   OUTFLOW  → fromAccountId required,  budgetType = NEED|WANT|SAVINGS
    //   TRANSFER → both required,           budgetType omitted
    export interface CreateRequest {
      fromAccountId?:  number;
      toAccountId?:    number;
      transactionFlow: TransactionFlow;
      transactionDate: string;
      description:     string;
      amount:          number;
      currencyCode:    string;
      exchangeRate:    number;
      budgetType?:     BudgetType;
      isRecurring?:    boolean;
      remarks?:        string;
    }

    // PATCH /api/transactions/:id  (only non-null fields applied)
    export interface UpdateRequest {
      description?:    string;
      budgetType?:     BudgetType;
      remarks?:        string;
      transactionDate?: string;
      amount?:         number;
    }

    // GET /api/transactions/summary?year=2025&month=6
    export interface MonthlySummaryResponse {
      year:          number;
      month:         number;
      totalInflow:   number;
      totalOutflow:  number;
      totalTransfer: number;
      netFlow:       number;
      byBudgetType:  Partial<Record<BudgetType, number>>;
    }

    // DELETE /api/transactions/:id  →  204 (reverses account balance)
    export type DeleteResponse = void;
  }

  // ===========================================================================
  // BUDGET  —  /api/budget/*
  // ===========================================================================
  export namespace Budget {

    // GET /api/budget?year=2025&month=6
    export interface QueryParams {
      year:  number;
      month: number;
    }

    // Stored config for a month (may not exist → backend returns defaults)
    export interface Config {
      id?:             number;
      year:            number;
      month:           number;
      needPercent:     number;     // e.g. 50.00
      wantPercent:     number;     // e.g. 30.00
      savingsPercent:  number;     // e.g. 20.00
      declaredIncome?: number;     // optional override; null = use actuals
    }

    // GET  /api/budget?year&month   →  BudgetSummaryResponse
    // PUT  /api/budget              →  BudgetSummaryResponse
    export interface SummaryResponse {
      config:          Config;
      actualIncome:    number;     // sum of INCOME transactions
      effectiveIncome: number;     // declaredIncome ?? actualIncome
      needTarget:      number;     // effectiveIncome × needPercent / 100
      wantTarget:      number;
      savingsTarget:   number;
      needActual:      number;     // sum of NEED transactions
      wantActual:      number;
      savingsActual:   number;
      spareCash:       number;     // effectiveIncome − (need + want + savings)
    }

    // GET /api/budget/history  →  Config[]
    export type HistoryResponse = Config[];

    // PUT /api/budget  (upsert — all fields optional, backend merges)
    export interface UpsertRequest {
      year:            number;
      month:           number;
      needPercent?:    number;
      wantPercent?:    number;
      savingsPercent?: number;
      declaredIncome?: number;
    }

    // DELETE /api/budget?year&month  →  204
    export type DeleteResponse = void;
  }

  // ===========================================================================
  // IMPORT  —  /api/import/*
  // ===========================================================================
  export namespace Import {

    // POST /api/import/upload?accountId=:id  (multipart/form-data, field: "file")
    export interface UploadParams {
      accountId: number;
    }

    // GET  /api/import/files         →  ImportedFile[]
    // GET  /api/import/files/:id     →  ImportedFile
    // POST /api/import/upload        →  ImportedFile
    export interface ImportedFile {
      id:           number;
      filename:     string;
      status:       ImportedFileStatus;
      accountId?:   number;
      account?:     { id: number; name: string };
      totalRows:    number;
      approvedRows: number;
      rejectedRows: number;
      pendingRows:  number;
      uploadedAt:   string;
      processedAt?: string;
      errorMessage?: string;
    }

    // GET /api/import/files/:id/rows  →  ImportRow[]
    export interface ImportRow {
      id:                    number;
      fileId:                number;
      transactionDate:       string;
      description:           string;
      amount:                number;
      isInflow:              boolean;
      currency:              string;
      budgetType?:           BudgetType;
      status:                ImportReviewStatus;
      errorMessage?:         string;
      createdTransactionId?: number;
    }

    // PUT /api/import/files/:fileId/rows/:importTxId
    export interface UpdateRowRequest {
      transactionDate?: string;
      description?:     string;
      amount?:          number;
      isInflow?:        boolean;
      currency?:        string;
      budgetType?:      BudgetType;
    }

    // POST /api/import/files/:fileId/rows/:importTxId/approve?accountId=:id
    export interface ApproveRowParams {
      accountId: number;
    }

    // POST /api/import/files/:fileId/bulk-approve?accountId=:id
    export interface BulkApproveParams {
      accountId: number;
    }

    // POST .../approve  →  ImportRow  (updated with status APPROVED)
    // POST .../reject   →  ImportRow  (updated with status REJECTED)
    // POST .../bulk-approve  →  ImportedFile  (file-level summary updated)
    // POST .../bulk-reject   →  ImportedFile
  }

  // ===========================================================================
  // EXCHANGE RATES  —  /api/exchange-rates/*
  // ===========================================================================
  export namespace ExchangeRates {

    // GET /api/exchange-rates          →  Rate[]
    // GET /api/exchange-rates/:code    →  Rate
    export interface Rate {
      currencyCode: string;   // e.g. "USD", "JPY"
      rateToSgd:   number;   // 1 unit of currency = X SGD
      updatedAt:   string;
    }

    // POST /api/exchange-rates/refresh  →  204 (triggers Frankfurter fetch)
    export type RefreshResponse = void;
  }

  // ===========================================================================
  // SHARED WRAPPERS
  // ===========================================================================

  /** Standard error shape returned by Spring Boot @ControllerAdvice */
  export interface ErrorResponse {
    status:    number;
    error:     string;
    message:   string;
    timestamp: string;
    path:      string;
  }

  /** Generic paginated wrapper — use if backend adds pagination later */
  export interface Page<T> {
    content:       T[];
    totalElements: number;
    totalPages:    number;
    number:        number;   // current page (0-indexed)
    size:          number;
  }
}
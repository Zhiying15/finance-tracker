// =============================================================================
// TYPES — Frontend-only UI state
//
// Domain types (Transaction, Account, Budget etc.) live in @api/index.ts
// as part of the Api namespace — that is the single source of truth for
// anything that touches the backend.
//
// This file re-exports Api domain types for convenience so components can
// import from one place, and adds purely frontend UI state types that have
// no backend equivalent.
// =============================================================================

// ─── Re-export all backend domain types ───────────────────────────────────────
// Components import from "@types/index" as before — no import-site changes needed.

export type {
  // Enums
  TransactionFlow,
  BudgetType,
  AssetClass,
  AccountCategory,
  ImportReviewStatus,
  ImportedFileStatus,
} from "@api/index";

// Re-export Api sub-namespace response shapes under flat names
// so existing component code (TransactionTable, DetailDrawer etc.) compiles
// without modification.
import type { Api } from "@api/index";

export type AuthUser            = Api.Auth.UserResponse;
export type DataDictionaryItem  = Api.DataDictionary.Item;
export type DataDictionaryGroup = Api.DataDictionary.Group;
export type DataDictionaryGroupCode = Api.DataDictionary.GroupCode;
export type AccountType         = Api.Accounts.AccountType;
export type Account             = Api.Accounts.Account;
export type CreateAccountRequest  = Api.Accounts.CreateRequest;
export type UpdateAccountRequest  = Api.Accounts.UpdateRequest;
export type NetWorth            = Api.Accounts.NetWorthResponse;
export type Transaction         = Api.Transactions.Transaction;
export type CreateTransactionRequest = Api.Transactions.CreateRequest;
export type UpdateTransactionRequest = Api.Transactions.UpdateRequest;
export type TransactionPeriodParams  = Api.Transactions.PeriodParams;
export type MonthlySummary      = Api.Transactions.MonthlySummaryResponse;
export type BudgetConfig        = Api.Budget.Config;
export type BudgetSummary       = Api.Budget.SummaryResponse;
export type UpsertBudgetRequest = Api.Budget.UpsertRequest;
export type ImportedFile        = Api.Import.ImportedFile;
export type ImportRow           = Api.Import.ImportRow;
export type UpdateImportRowRequest = Api.Import.UpdateRowRequest;
export type ExchangeRate        = Api.ExchangeRates.Rate;
export type ApiError            = Api.ErrorResponse;

// Auth request shapes (used in LoginPage, AuthContext)
export type LoginRequest    = Api.Auth.LoginRequest;
export type RegisterRequest = Api.Auth.RegisterRequest;

// =============================================================================
// UI STATE — frontend-only, no backend equivalent
// =============================================================================

/** Active filter state for the Transactions page */
export interface TransactionFilters {
  flow?:       TransactionFlow;
  budgetType?: BudgetType;
  accountId?:  number;
  year?:       number;
  month?:      number;
  search?:     string;
}

/** Month picker helper used in Dashboard / Budget period selector */
export interface DatePeriod {
  year:  number;
  month: number; // 1–12
}

// ─── Re-export for convenience ─────────────────────────────────────────────────
// Allows: import type { Api } from "@types/index" alongside the flat aliases above

export type { Api } from "@api/index";

// Resolve circular — TransactionFlow etc. need to be in scope for UI types above
import type { TransactionFlow, BudgetType } from "@api/index";
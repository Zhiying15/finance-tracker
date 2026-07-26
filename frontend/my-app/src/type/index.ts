// =============================================================================
// TYPES — Re-exports + frontend-only UI state
//
// Domain types live in @api/index under the Api namespace.
// This file re-exports them as flat aliases for component convenience,
// and defines purely frontend UI state types.
// =============================================================================

import type { Api, TransactionFlow, BudgetType } from "@api/index";

// ─── Enum re-exports ──────────────────────────────────────────────────────────
export type {
  TransactionFlow,
  BudgetType,
  AssetClass,
  AccountCategory,
  ImportReviewStatus,
  ImportedFileStatus,
} from "@api/index";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type AuthUser         = Api.Auth.UserResponse;
export type LoginRequest     = Api.Auth.LoginRequest;
export type RegisterRequest  = Api.Auth.RegisterRequest;

// ─── Data Dictionary ──────────────────────────────────────────────────────────
export type DataDictionaryItem      = Api.DataDictionary.Item;
export type DataDictionaryGroup     = Api.DataDictionary.Group;
export type DataDictionaryGroupCode = Api.DataDictionary.GroupCode;

// ─── Accounts ─────────────────────────────────────────────────────────────────
export type AccountType             = Api.Accounts.AccountType;
export type Account                 = Api.Accounts.Account;
export type CreateAccountRequest    = Api.Accounts.CreateRequest;
export type UpdateAccountRequest    = Api.Accounts.UpdateRequest;
export type UpdateValuationRequest  = Api.Accounts.UpdateValuationRequest;
export type NetWorth                = Api.Accounts.NetWorthResponse;

// ─── Transactions ─────────────────────────────────────────────────────────────
export type Transaction             = Api.Transactions.Transaction;
export type CreateTransactionRequest = Api.Transactions.CreateRequest;
export type UpdateTransactionRequest = Api.Transactions.UpdateRequest;
export type TransactionPeriodParams = Api.Transactions.PeriodParams;
export type MonthlySummary          = Api.Transactions.MonthlySummaryResponse;

// ─── Budget ───────────────────────────────────────────────────────────────────
export type BudgetConfig            = Api.Budget.Config;
export type BudgetSummary           = Api.Budget.SummaryResponse;
export type UpsertBudgetRequest     = Api.Budget.UpsertRequest;

// ─── Import ───────────────────────────────────────────────────────────────────
export type ImportedFile            = Api.Import.ImportedFile;
export type ImportRow               = Api.Import.ImportRow;
export type UpdateImportRowRequest  = Api.Import.UpdateRowRequest;

// ─── Exchange Rates ───────────────────────────────────────────────────────────
export type ExchangeRate            = Api.ExchangeRates.Rate;

// ─── Error ────────────────────────────────────────────────────────────────────
export type ApiError                = Api.ErrorResponse;

// ─── Re-export Api namespace ──────────────────────────────────────────────────
export type { Api } from "@api/index";

// =============================================================================
// UI STATE — frontend-only, no backend equivalent
// =============================================================================

export interface TransactionFilters {
  flow?:       TransactionFlow;
  budgetType?: BudgetType;
  accountId?:  number;
  year?:       number;
  month?:      number;
  search?:     string;
}

export interface DatePeriod {
  year:  number;
  month: number;
}
// =============================================================================
// MOCK DATA — temporary until backend is connected
// All shapes match real backend contracts. Replace each export with an API call.
//
// Replacement map:
//   MOCK_TRANSACTIONS   → transactionsApi.listByPeriod({ year, month })
//   MOCK_SUMMARY        → transactionsApi.getSummary({ year, month })
//   MOCK_BUDGET_SUMMARY → budgetApi.getSummary({ year, month })
//   MOCK_NET_WORTH      → accountsApi.getNetWorth()
//   MOCK_UPLOADS        → importApi.listFiles()
// =============================================================================

import type { Api } from "@api/index";

// Flat type aliases for convenience
type Transaction    = Api.Transactions.Transaction;
type MonthlySummary = Api.Transactions.MonthlySummaryResponse;
type BudgetSummary  = Api.Budget.SummaryResponse;
type ImportedFile   = Api.Import.ImportedFile;
type NetWorth       = Api.Accounts.NetWorthResponse;

// ─── Transactions ─────────────────────────────────────────────────────────────

const RAW: Omit<Transaction, "fromAccount" | "toAccount">[] = [
  { id: 1,  fromAccountId: undefined, toAccountId: 1,         transactionFlow: "INFLOW",   transactionDate: "2025-06-01", description: "Monthly Salary",        amount: 8500,  currencyCode: "SGD", exchangeRate: 1,      amountSgd: 8500,  budgetType: "INCOME",  isRecurring: true,  createdAt: "2025-06-01T00:00:00Z", updatedAt: "2025-06-01T00:00:00Z" },
  { id: 2,  fromAccountId: undefined, toAccountId: 1,         transactionFlow: "INFLOW",   transactionDate: "2025-06-03", description: "Freelance Project X",   amount: 1200,  currencyCode: "SGD", exchangeRate: 1,      amountSgd: 1200,  budgetType: "INCOME",  isRecurring: false, createdAt: "2025-06-03T00:00:00Z", updatedAt: "2025-06-03T00:00:00Z" },
  { id: 3,  fromAccountId: 1,         toAccountId: undefined, transactionFlow: "OUTFLOW",  transactionDate: "2025-06-05", description: "Rental Payment",        amount: 2200,  currencyCode: "SGD", exchangeRate: 1,      amountSgd: 2200,  budgetType: "NEED",    isRecurring: true,  createdAt: "2025-06-05T00:00:00Z", updatedAt: "2025-06-05T00:00:00Z" },
  { id: 4,  fromAccountId: 1,         toAccountId: undefined, transactionFlow: "OUTFLOW",  transactionDate: "2025-06-07", description: "NTUC FairPrice",        amount: 320,   currencyCode: "SGD", exchangeRate: 1,      amountSgd: 320,   budgetType: "NEED",    isRecurring: false, createdAt: "2025-06-07T00:00:00Z", updatedAt: "2025-06-07T00:00:00Z" },
  { id: 5,  fromAccountId: 1,         toAccountId: undefined, transactionFlow: "OUTFLOW",  transactionDate: "2025-06-09", description: "Grab Transport",        amount: 85,    currencyCode: "SGD", exchangeRate: 1,      amountSgd: 85,    budgetType: "NEED",    isRecurring: false, createdAt: "2025-06-09T00:00:00Z", updatedAt: "2025-06-09T00:00:00Z" },
  { id: 6,  fromAccountId: 1,         toAccountId: undefined, transactionFlow: "OUTFLOW",  transactionDate: "2025-06-10", description: "Netflix + Spotify",     amount: 32,    currencyCode: "SGD", exchangeRate: 1,      amountSgd: 32,    budgetType: "WANT",    isRecurring: true,  createdAt: "2025-06-10T00:00:00Z", updatedAt: "2025-06-10T00:00:00Z" },
  { id: 7,  fromAccountId: 1,         toAccountId: undefined, transactionFlow: "OUTFLOW",  transactionDate: "2025-06-12", description: "Dinner at Odette",      amount: 280,   currencyCode: "SGD", exchangeRate: 1,      amountSgd: 280,   budgetType: "WANT",    isRecurring: false, createdAt: "2025-06-12T00:00:00Z", updatedAt: "2025-06-12T00:00:00Z" },
  { id: 8,  fromAccountId: undefined, toAccountId: 1,         transactionFlow: "INFLOW",   transactionDate: "2025-06-14", description: "Dividend Income",       amount: 450,   currencyCode: "SGD", exchangeRate: 1,      amountSgd: 450,   budgetType: "INCOME",  isRecurring: false, createdAt: "2025-06-14T00:00:00Z", updatedAt: "2025-06-14T00:00:00Z" },
  { id: 9,  fromAccountId: 1,         toAccountId: 2,         transactionFlow: "TRANSFER", transactionDate: "2025-06-15", description: "Emergency Fund Top-up", amount: 500,   currencyCode: "SGD", exchangeRate: 1,      amountSgd: 500,   budgetType: "SAVINGS", isRecurring: true,  createdAt: "2025-06-15T00:00:00Z", updatedAt: "2025-06-15T00:00:00Z" },
  { id: 10, fromAccountId: 1,         toAccountId: undefined, transactionFlow: "OUTFLOW",  transactionDate: "2025-06-18", description: "Zara Shopping",         amount: 210,   currencyCode: "SGD", exchangeRate: 1,      amountSgd: 210,   budgetType: "WANT",    isRecurring: false, createdAt: "2025-06-18T00:00:00Z", updatedAt: "2025-06-18T00:00:00Z" },
  { id: 11, fromAccountId: 1,         toAccountId: undefined, transactionFlow: "OUTFLOW",  transactionDate: "2025-06-20", description: "SP Utilities",          amount: 145,   currencyCode: "SGD", exchangeRate: 1,      amountSgd: 145,   budgetType: "NEED",    isRecurring: true,  createdAt: "2025-06-20T00:00:00Z", updatedAt: "2025-06-20T00:00:00Z" },
  { id: 12, fromAccountId: 1,         toAccountId: 3,         transactionFlow: "TRANSFER", transactionDate: "2025-06-22", description: "CPF Contribution",      amount: 1000,  currencyCode: "SGD", exchangeRate: 1,      amountSgd: 1000,  budgetType: "SAVINGS", isRecurring: true,  createdAt: "2025-06-22T00:00:00Z", updatedAt: "2025-06-22T00:00:00Z" },
  { id: 13, fromAccountId: 1,         toAccountId: undefined, transactionFlow: "OUTFLOW",  transactionDate: "2025-06-25", description: "Cold Storage",          amount: 180,   currencyCode: "SGD", exchangeRate: 1,      amountSgd: 180,   budgetType: "NEED",    isRecurring: false, createdAt: "2025-06-25T00:00:00Z", updatedAt: "2025-06-25T00:00:00Z" },
  { id: 14, fromAccountId: undefined, toAccountId: 1,         transactionFlow: "INFLOW",   transactionDate: "2025-06-27", description: "Freelance Project Y",   amount: 800,   currencyCode: "SGD", exchangeRate: 1,      amountSgd: 800,   budgetType: "INCOME",  isRecurring: false, createdAt: "2025-06-27T00:00:00Z", updatedAt: "2025-06-27T00:00:00Z" },
  { id: 15, fromAccountId: 1,         toAccountId: undefined, transactionFlow: "OUTFLOW",  transactionDate: "2025-06-10", description: "Hotel booking Tokyo",   amount: 50000, currencyCode: "JPY", exchangeRate: 0.0087, amountSgd: 435,   budgetType: "WANT",    isRecurring: false, remarks: "1 JPY = 0.0087 SGD", createdAt: "2025-06-10T00:00:00Z", updatedAt: "2025-06-10T00:00:00Z" },
];

export const MOCK_TRANSACTIONS: Transaction[] = RAW;

// ─── Derived totals ───────────────────────────────────────────────────────────

const income  = RAW.filter((t) => t.budgetType === "INCOME" ).reduce((s, t) => s + t.amountSgd, 0); // 10950
const need    = RAW.filter((t) => t.budgetType === "NEED"   ).reduce((s, t) => s + t.amountSgd, 0); // 2930
const want    = RAW.filter((t) => t.budgetType === "WANT"   ).reduce((s, t) => s + t.amountSgd, 0); // 1007
const savings = RAW.filter((t) => t.budgetType === "SAVINGS").reduce((s, t) => s + t.amountSgd, 0); // 1500

// ─── Monthly Summary  (→ transactionsApi.getSummary) ─────────────────────────

export const MOCK_SUMMARY: MonthlySummary = {
  year:          2025,
  month:         6,
  totalInflow:   10950,
  totalOutflow:  4237,   // need + want (excl. savings/transfer)
  totalTransfer: 1500,
  netFlow:       5213,
  byBudgetType: {
    INCOME:  10950,
    NEED:    need,
    WANT:    want,
    SAVINGS: savings,
  },
};

// ─── Budget Summary  (→ budgetApi.getSummary) ─────────────────────────────────

export const MOCK_BUDGET_SUMMARY: BudgetSummary = {
  config: {
    year:           2025,
    month:          6,
    needPercent:    50,
    wantPercent:    30,
    savingsPercent: 20,
  },
  actualIncome:    income,
  effectiveIncome: income,
  needTarget:      income * 0.5,
  wantTarget:      income * 0.3,
  savingsTarget:   income * 0.2,
  needActual:      need,
  wantActual:      want,
  savingsActual:   savings,
  spareCash:       income - (need + want + savings),
};

// ─── Net Worth  (→ accountsApi.getNetWorth) ───────────────────────────────────

export const MOCK_NET_WORTH: NetWorth = {
  totalAssets:      92500,
  totalLiabilities: 5080,
  netWorth:         87420,
  currencyCode:     "SGD",
  asOf:             "2025-06-30",
};

// ─── Import history  (→ importApi.listFiles) ──────────────────────────────────

export const MOCK_UPLOADS: ImportedFile[] = [
  { id: 1, filename: "dbs-june-2025.csv",  status: "COMPLETED",      totalRows: 9,  approvedRows: 9,  rejectedRows: 0, pendingRows: 0, uploadedAt: "2025-06-28T10:00:00Z" },
  { id: 2, filename: "paypal-june.csv",    status: "PENDING_REVIEW", totalRows: 5,  approvedRows: 2,  rejectedRows: 0, pendingRows: 3, uploadedAt: "2025-06-27T14:30:00Z" },
  { id: 3, filename: "ocbc-may-2025.csv",  status: "COMPLETED",      totalRows: 14, approvedRows: 13, rejectedRows: 1, pendingRows: 0, uploadedAt: "2025-05-30T09:15:00Z" },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

export const formatCurrency = (amount: number, currency = "SGD"): string =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency }).format(amount);

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-SG", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(iso));

export const formatMonth = (year: number, month: number): string =>
  new Intl.DateTimeFormat("en-SG", { month: "long", year: "numeric" })
    .format(new Date(year, month - 1));
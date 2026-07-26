import type { Api } from "@api/index";

type Transaction    = Api.Transactions.Transaction;
type MonthlySummary = Api.Transactions.MonthlySummaryResponse;
type BudgetSummary  = Api.Budget.SummaryResponse;
type ImportedFile   = Api.Import.ImportedFile;
type NetWorth       = Api.Accounts.NetWorthResponse;

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

const income  = RAW.filter((t) => t.budgetType === "INCOME" ).reduce((s, t) => s + t.amountSgd, 0);
const need    = RAW.filter((t) => t.budgetType === "NEED"   ).reduce((s, t) => s + t.amountSgd, 0);
const want    = RAW.filter((t) => t.budgetType === "WANT"   ).reduce((s, t) => s + t.amountSgd, 0);
const savings = RAW.filter((t) => t.budgetType === "SAVINGS").reduce((s, t) => s + t.amountSgd, 0);

export const MOCK_SUMMARY: MonthlySummary = {
  year: 2025, month: 6,
  totalInflow: 10950, totalOutflow: 4237, totalTransfer: 1500, netFlow: 5213,
  byBudgetType: { INCOME: income, NEED: need, WANT: want, SAVINGS: savings },
};

export const MOCK_BUDGET_SUMMARY: BudgetSummary = {
  config: { year: 2025, month: 6, needPercent: 50, wantPercent: 30, savingsPercent: 20 },
  actualIncome: income, effectiveIncome: income,
  needTarget: income * 0.5, wantTarget: income * 0.3, savingsTarget: income * 0.2,
  needActual: need, wantActual: want, savingsActual: savings,
  spareCash: income - (need + want + savings),
};

export const MOCK_NET_WORTH: NetWorth = {
  totalAssets: 92500, totalLiabilities: 5080, netWorth: 87420,
  currencyCode: "SGD", asOf: "2025-06-30",
};

export const MOCK_UPLOADS: ImportedFile[] = [
  { id: 1, filename: "dbs-june-2025.csv",  status: "COMPLETED",      totalRows: 9,  approvedRows: 9,  rejectedRows: 0, pendingRows: 0, uploadedAt: "2025-06-28T10:00:00Z" },
  { id: 2, filename: "paypal-june.csv",    status: "PENDING_REVIEW", totalRows: 5,  approvedRows: 2,  rejectedRows: 0, pendingRows: 3, uploadedAt: "2025-06-27T14:30:00Z" },
  { id: 3, filename: "ocbc-may-2025.csv",  status: "COMPLETED",      totalRows: 14, approvedRows: 13, rejectedRows: 1, pendingRows: 0, uploadedAt: "2025-05-30T09:15:00Z" },
];

export const formatCurrency = (amount: number, currency = "SGD"): string =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency }).format(amount);

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-SG", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));

export const formatMonth = (year: number, month: number): string =>
  new Intl.DateTimeFormat("en-SG", { month: "long", year: "numeric" }).format(new Date(year, month - 1));

// ─── Accounts ─────────────────────────────────────────────────────────────────

type Account     = Api.Accounts.Account;
type AccountType = Api.Accounts.AccountType;

export const MOCK_ACCOUNT_TYPES: AccountType[] = [
  { id: 1,  name: "Bank Account",       assetClass: "CASH",         accountCategory: "ASSET"     },
  { id: 2,  name: "Savings Account",    assetClass: "CASH",         accountCategory: "ASSET"     },
  { id: 3,  name: "Fixed Deposit",      assetClass: "FIXED_INCOME", accountCategory: "ASSET"     },
  { id: 4,  name: "CPF",                assetClass: "FIXED_INCOME", accountCategory: "ASSET"     },
  { id: 5,  name: "Property",           assetClass: "REAL_ESTATE",  accountCategory: "ASSET"     },
  { id: 6,  name: "Stocks / ETF",       assetClass: "EQUITY",       accountCategory: "ASSET"     },
  { id: 7,  name: "Crypto",             assetClass: "CRYPTO",       accountCategory: "ASSET"     },
  { id: 8,  name: "SRS",                assetClass: "FIXED_INCOME", accountCategory: "ASSET"     },
  { id: 9,  name: "Insurance / Endowment", assetClass: "OTHER",     accountCategory: "ASSET"     },
  { id: 10, name: "Credit Card",        assetClass: "CASH",         accountCategory: "LIABILITY" },
  { id: 11, name: "Personal Loan",      assetClass: "CASH",         accountCategory: "LIABILITY" },
  { id: 12, name: "Mortgage",           assetClass: "REAL_ESTATE",  accountCategory: "LIABILITY" },
];

export const MOCK_ACCOUNTS: Account[] = [
  { id: 1,  accountTypeId: 1,  name: "DBS Multiplier",        institution: "DBS",       accountNumber: "**** 4521", currencyCode: "SGD", openingBalance: 5000,    currentBalance: 18420,   manualValuation: false, includeInNetWorth: true,  isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2025-06-30T00:00:00Z" },
  { id: 2,  accountTypeId: 2,  name: "OCBC 360",              institution: "OCBC",      accountNumber: "**** 8832", currencyCode: "SGD", openingBalance: 2000,    currentBalance: 6200,    manualValuation: false, includeInNetWorth: true,  isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2025-06-30T00:00:00Z" },
  { id: 3,  accountTypeId: 4,  name: "CPF Ordinary Account",  institution: "CPF Board", currencyCode: "SGD",        openingBalance: 40000,   currentBalance: 48500,   manualValuation: false, includeInNetWorth: true,  isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2025-06-30T00:00:00Z" },
  { id: 4,  accountTypeId: 4,  name: "CPF Special Account",   institution: "CPF Board", currencyCode: "SGD",        openingBalance: 15000,   currentBalance: 18200,   manualValuation: false, includeInNetWorth: true,  isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2025-06-30T00:00:00Z" },
  { id: 5,  accountTypeId: 5,  name: "HDB Flat",              institution: "HDB",       currencyCode: "SGD",        openingBalance: 450000,  currentBalance: 465000,  manualValuation: true,  manualBalance: 465000, lastValuationDate: "2025-01-01", includeInNetWorth: true,  isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
  { id: 6,  accountTypeId: 6,  name: "Tiger Brokers",         institution: "Tiger",     currencyCode: "SGD",        openingBalance: 10000,   currentBalance: 14200,   manualValuation: false, includeInNetWorth: true,  isActive: true,  createdAt: "2024-06-01T00:00:00Z", updatedAt: "2025-06-30T00:00:00Z" },
  { id: 7,  accountTypeId: 10, name: "DBS Altitude Visa",     institution: "DBS",       accountNumber: "**** 3390", currencyCode: "SGD", openingBalance: 0,       currentBalance: -2380,   manualValuation: false, includeInNetWorth: true,  isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2025-06-30T00:00:00Z" },
  { id: 8,  accountTypeId: 2,  name: "Emergency Fund",        institution: "DBS",       accountNumber: "**** 7701", currencyCode: "SGD", openingBalance: 10000,   currentBalance: 14500,   manualValuation: false, includeInNetWorth: true,  isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2025-06-30T00:00:00Z" },
  { id: 9,  accountTypeId: 7,  name: "Crypto (BTC/ETH)",      institution: "Coinbase",  currencyCode: "SGD",        openingBalance: 3000,    currentBalance: 5080,    manualValuation: false, includeInNetWorth: true,  isActive: true,  createdAt: "2024-01-01T00:00:00Z", updatedAt: "2025-06-30T00:00:00Z" },
  { id: 10, accountTypeId: 1,  name: "Old POSB Account",      institution: "POSB",      accountNumber: "**** 1122", currencyCode: "SGD", openingBalance: 500,     currentBalance: 500,     manualValuation: false, includeInNetWorth: false, isActive: false, notes: "Dormant — to be closed", createdAt: "2020-01-01T00:00:00Z", updatedAt: "2022-01-01T00:00:00Z" },
];

// ─── Import rows ───────────────────────────────────────────────────────────────

type ImportRow = Api.Import.ImportRow;

export const MOCK_IMPORT_ROWS: ImportRow[] = [
  { id: 1,  fileId: 2, transactionDate: "2025-06-01", description: "GRAB* RIDE",            amount: 12.50,  isInflow: false, currency: "SGD", budgetType: "NEED",    status: "NEW"      },
  { id: 2,  fileId: 2, transactionDate: "2025-06-02", description: "NTUC FAIRPRICE",         amount: 87.30,  isInflow: false, currency: "SGD", budgetType: "NEED",    status: "NEW"      },
  { id: 3,  fileId: 2, transactionDate: "2025-06-03", description: "NETFLIX.COM",            amount: 15.98,  isInflow: false, currency: "SGD", budgetType: "WANT",    status: "APPROVED" },
  { id: 4,  fileId: 2, transactionDate: "2025-06-04", description: "SHOPEE PAY",             amount: 45.00,  isInflow: false, currency: "SGD",                        status: "NEW"      },
  { id: 5,  fileId: 2, transactionDate: "2025-06-05", description: "PAYNOW FROM JOHN",       amount: 200.00, isInflow: true,  currency: "SGD",                        status: "NEW"      },
  { id: 6,  fileId: 2, transactionDate: "2025-06-06", description: "STARBUCKS",              amount: 9.80,   isInflow: false, currency: "SGD", budgetType: "WANT",    status: "REJECTED" },
  { id: 7,  fileId: 2, transactionDate: "2025-06-07", description: "SP SERVICES PTE LTD",   amount: 145.20, isInflow: false, currency: "SGD", budgetType: "NEED",    status: "NEW"      },
  { id: 8,  fileId: 2, transactionDate: "2025-06-08", description: "AMZN MKTP SG",          amount: 34.90,  isInflow: false, currency: "SGD",                        status: "ERROR",   errorMessage: "Could not determine budget type" },
  { id: 9,  fileId: 2, transactionDate: "2025-06-09", description: "GRAB FOOD",             amount: 22.40,  isInflow: false, currency: "SGD", budgetType: "WANT",    status: "NEW"      },
  { id: 10, fileId: 2, transactionDate: "2025-06-10", description: "SALARY CREDIT",         amount: 8500.00,isInflow: true,  currency: "SGD", budgetType: "INCOME",  status: "APPROVED" },
];
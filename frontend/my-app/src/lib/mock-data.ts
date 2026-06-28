import type {
  Transaction,
  TransactionCategory,
  MonthlySummary,
  UploadBatch,
} from "@type/index";

// ─── Categories (will come from backend) ────────────────────────────────────

export const MOCK_CATEGORIES: TransactionCategory[] = [
  // Inflow
  { id: "cat_salary",     name: "Salary",        flow: "inflow",  bucket: "uncategorised", color: "#10B981" },
  { id: "cat_freelance",  name: "Freelance",     flow: "inflow",  bucket: "uncategorised", color: "#34D399" },
  { id: "cat_investment", name: "Investment",    flow: "inflow",  bucket: "uncategorised", color: "#6EE7B7" },
  // Outflow — Needs
  { id: "cat_rent",       name: "Rent",          flow: "outflow", bucket: "need",          color: "#6366F1" },
  { id: "cat_groceries",  name: "Groceries",     flow: "outflow", bucket: "need",          color: "#818CF8" },
  { id: "cat_transport",  name: "Transport",     flow: "outflow", bucket: "need",          color: "#A5B4FC" },
  { id: "cat_utilities",  name: "Utilities",     flow: "outflow", bucket: "need",          color: "#C7D2FE" },
  // Outflow — Wants
  { id: "cat_dining",     name: "Dining Out",    flow: "outflow", bucket: "want",          color: "#F59E0B" },
  { id: "cat_entertain",  name: "Entertainment", flow: "outflow", bucket: "want",          color: "#FCD34D" },
  { id: "cat_shopping",   name: "Shopping",      flow: "outflow", bucket: "want",          color: "#FDE68A" },
  // Outflow — Savings
  { id: "cat_emergency",  name: "Emergency Fund",flow: "outflow", bucket: "savings",       color: "#F43F5E" },
  { id: "cat_retirement", name: "Retirement",    flow: "outflow", bucket: "savings",       color: "#FB7185" },
];

const categoryMap = Object.fromEntries(MOCK_CATEGORIES.map((c) => [c.id, c]));

// ─── Transactions ─────────────────────────────────────────────────────────────
//
// WHY RAW_TRANSACTIONS is typed separately:
// Without the explicit Omit<Transaction, "category">[] annotation, TypeScript
// infers the array element type from the object literals, widening
// "inflow" | "outflow" → string and "manual" | "upload" → string.
// The .map() spread { ...t } then carries that widened type, making the result
// incompatible with Transaction[]. Annotating the raw array before .map()
// locks in the literal types so the spread preserves them correctly.

const RAW_TRANSACTIONS: Omit<Transaction, "category">[] = [
  { id: "txn_001", date: "2025-06-01", description: "Monthly Salary",        amount: 8500,  flow: "inflow",  categoryId: "cat_salary",     source: "manual" },
  { id: "txn_002", date: "2025-06-03", description: "Freelance Project X",   amount: 1200,  flow: "inflow",  categoryId: "cat_freelance",  source: "upload" },
  { id: "txn_003", date: "2025-06-05", description: "Rental Payment",        amount: 2200,  flow: "outflow", categoryId: "cat_rent",       source: "upload" },
  { id: "txn_004", date: "2025-06-07", description: "NTUC FairPrice",        amount: 320,   flow: "outflow", categoryId: "cat_groceries",  source: "upload" },
  { id: "txn_005", date: "2025-06-09", description: "Grab Transport",        amount: 85,    flow: "outflow", categoryId: "cat_transport",  source: "upload" },
  { id: "txn_006", date: "2025-06-10", description: "Netflix + Spotify",     amount: 32,    flow: "outflow", categoryId: "cat_entertain",  source: "upload" },
  { id: "txn_007", date: "2025-06-12", description: "Dinner at Odette",      amount: 280,   flow: "outflow", categoryId: "cat_dining",     source: "manual" },
  { id: "txn_008", date: "2025-06-14", description: "Dividend Income",       amount: 450,   flow: "inflow",  categoryId: "cat_investment", source: "upload" },
  { id: "txn_009", date: "2025-06-15", description: "Emergency Fund Top-up", amount: 500,   flow: "outflow", categoryId: "cat_emergency",  source: "manual" },
  { id: "txn_010", date: "2025-06-18", description: "Zara Shopping",         amount: 210,   flow: "outflow", categoryId: "cat_shopping",   source: "upload" },
  { id: "txn_011", date: "2025-06-20", description: "SP Utilities",          amount: 145,   flow: "outflow", categoryId: "cat_utilities",  source: "upload" },
  { id: "txn_012", date: "2025-06-22", description: "CPF / Retirement",      amount: 1000,  flow: "outflow", categoryId: "cat_retirement", source: "manual" },
  { id: "txn_013", date: "2025-06-25", description: "Cold Storage",          amount: 180,   flow: "outflow", categoryId: "cat_groceries",  source: "upload" },
  { id: "txn_014", date: "2025-06-27", description: "Freelance Project Y",   amount: 800,   flow: "inflow",  categoryId: "cat_freelance",  source: "manual" },
];

export const MOCK_TRANSACTIONS: Transaction[] = RAW_TRANSACTIONS.map((t) => ({
  ...t,
  category: categoryMap[t.categoryId],
}));

// ─── Monthly Summary ─────────────────────────────────────────────────────────

export const MOCK_SUMMARY: MonthlySummary = {
  month: "2025-06",
  totalInflow:  10950,
  totalOutflow:  4952,
  totalAssets:  87420,
  budget: {
    month:        "2025-06",
    totalInflow:  10950,
    totalOutflow:  4952,
    needs:         2750,
    wants:          522,
    savings:       1500,
    spareCash:     6178, // 10950 - (2750 + 522 + 1500)
  },
  forecast: {
    month:               "2025-07",
    projectedInflow:     10500,
    projectedNeeds:       2800,
    projectedWants:        600,
    projectedSavings:     1500,
    projectedSpareCash:   5600,
  },
};

// ─── Upload History ───────────────────────────────────────────────────────────

export const MOCK_UPLOADS: UploadBatch[] = [
  { id: "up_001", filename: "dbs-june-2025.pdf", fileType: "pdf", uploadedAt: "2025-06-28T10:00:00Z", status: "success", transactionCount: 9  },
  { id: "up_002", filename: "paypal-june.csv",   fileType: "csv", uploadedAt: "2025-06-27T14:30:00Z", status: "success", transactionCount: 3  },
  { id: "up_003", filename: "ocbc-may-2025.pdf", fileType: "pdf", uploadedAt: "2025-05-30T09:15:00Z", status: "success", transactionCount: 14 },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

export const formatCurrency = (amount: number, currency = "SGD"): string =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency }).format(amount);

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-SG", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  }).format(new Date(iso));
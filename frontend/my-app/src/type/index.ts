// ─── Transaction ────────────────────────────────────────────────────────────

export type TransactionFlow = "inflow" | "outflow";

export type BudgetBucket = "need" | "want" | "savings" | "uncategorised";

export interface TransactionCategory {
  id: string;
  name: string;
  parentId?: string; // supports two-level hierarchy
  flow: TransactionFlow;
  bucket: BudgetBucket;
  color?: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO 8601
  description: string;
  amount: number; // always positive; flow determines direction
  flow: TransactionFlow;
  categoryId: string;
  category?: TransactionCategory;
  notes?: string;
  source?: "manual" | "upload";
  uploadBatchId?: string;
}

// ─── Budget ─────────────────────────────────────────────────────────────────

export interface BudgetTarget {
  month: string; // "YYYY-MM"
  needPercent: number;
  wantPercent: number;
  savingsPercent: number;
}

export interface BudgetActual {
  month: string;
  totalInflow: number;
  totalOutflow: number;
  needs: number;
  wants: number;
  savings: number;
  spareCash: number; // totalInflow - (needs + wants + savings)
}

export interface BudgetForecast {
  month: string;
  projectedInflow: number;
  projectedNeeds: number;
  projectedWants: number;
  projectedSavings: number;
  projectedSpareCash: number;
}

// ─── Dashboard Summary ───────────────────────────────────────────────────────

export interface MonthlySummary {
  month: string;
  totalInflow: number;
  totalOutflow: number;
  totalAssets: number;
  budget: BudgetActual;
  forecast: BudgetForecast;
}

// ─── File Upload ─────────────────────────────────────────────────────────────

export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";

export interface UploadBatch {
  id: string;
  filename: string;
  fileType: string;
  uploadedAt: string;
  status: UploadStatus;
  transactionCount?: number;
  errorMessage?: string;
}

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export interface DateRangeFilter {
  from: string;
  to: string;
}

export interface TransactionFilters {
  flow?: TransactionFlow;
  categoryId?: string;
  bucket?: BudgetBucket;
  dateRange?: DateRangeFilter;
  search?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

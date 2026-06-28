import { useState, useMemo } from "react";
import { Link } from "react-router";
import { TransactionTable } from "@components/ui/TransactionTable";
import { MOCK_TRANSACTIONS, MOCK_CATEGORIES, formatCurrency } from "@lib/mock-data";
import type { TransactionFilters, TransactionFlow, BudgetBucket } from "@type/index";

const FLOW_OPTIONS: { value: TransactionFlow | "all"; label: string }[] = [
  { value: "all",     label: "All"     },
  { value: "inflow",  label: "Inflow"  },
  { value: "outflow", label: "Outflow" },
];

const BUCKET_OPTIONS: { value: BudgetBucket | "all"; label: string }[] = [
  { value: "all",           label: "All Buckets" },
  { value: "need",          label: "Needs"        },
  { value: "want",          label: "Wants"        },
  { value: "savings",       label: "Savings"      },
  { value: "uncategorised", label: "Uncat."       },
];

export function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters & { flowAll?: boolean; bucketAll?: boolean }>({});
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((txn) => {
      if (filters.flow && txn.flow !== filters.flow) return false;
      if (filters.bucket && txn.category?.bucket !== filters.bucket) return false;
      if (filters.categoryId && txn.categoryId !== filters.categoryId) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!txn.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filters, search]);

  const totalInflow  = filtered.filter((t) => t.flow === "inflow").reduce((s, t) => s + t.amount, 0);
  const totalOutflow = filtered.filter((t) => t.flow === "outflow").reduce((s, t) => s + t.amount, 0);

  function setFlow(value: string) {
    setFilters((f) => ({ ...f, flow: value === "all" ? undefined : value as TransactionFlow }));
  }

  function setBucket(value: string) {
    setFilters((f) => ({ ...f, bucket: value === "all" ? undefined : value as BudgetBucket }));
  }

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="flex flex-wrap gap-4">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3">
          <p className="text-xs text-slate-500">Filtered Inflow</p>
          <p className="mt-0.5 font-bold tabular-nums text-emerald-400">{formatCurrency(totalInflow)}</p>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-3">
          <p className="text-xs text-slate-500">Filtered Outflow</p>
          <p className="mt-0.5 font-bold tabular-nums text-rose-400">{formatCurrency(totalOutflow)}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3">
          <p className="text-xs text-slate-500">Transactions</p>
          <p className="mt-0.5 font-bold tabular-nums text-slate-200">{filtered.length}</p>
        </div>

        <Link
          to="/transactions/new"
          className="ml-auto inline-flex items-center gap-2 self-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          + Add Transaction
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
        {/* Search */}
        <label className="sr-only" htmlFor="txn-search">Search transactions</label>
        <input
          id="txn-search"
          type="search"
          placeholder="Search description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-48 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {/* Flow filter */}
        <fieldset className="flex gap-1" aria-label="Filter by flow">
          {FLOW_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setFlow(o.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                (filters.flow ?? "all") === o.value
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}
            >
              {o.label}
            </button>
          ))}
        </fieldset>

        {/* Bucket filter */}
        <fieldset className="flex gap-1" aria-label="Filter by budget bucket">
          {BUCKET_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setBucket(o.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                (filters.bucket ?? "all") === o.value
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}
            >
              {o.label}
            </button>
          ))}
        </fieldset>

        {/* Category filter */}
        <label className="sr-only" htmlFor="category-filter">Filter by category</label>
        <select
          id="category-filter"
          value={filters.categoryId ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value || undefined }))}
          className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {MOCK_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Clear */}
        {(filters.flow ?? filters.bucket ?? filters.categoryId ?? search) && (
          <button
            onClick={() => { setFilters({}); setSearch(""); }}
            className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <TransactionTable transactions={filtered} />
    </div>
  );
}

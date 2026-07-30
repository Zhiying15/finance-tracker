import { useState } from "react";
import { Link } from "react-router";
import { TransactionTable } from "@components/ui/TransactionTable";
import { PageLoader }       from "@components/ui/PageLoader";
import { usePeriod }        from "@hooks/usePeriod";
import { useTransactions }  from "@hooks/useTransactions";
import { formatCurrency, formatMonth } from "@lib/mock-data";
import type { TransactionFlow, BudgetType } from "@api/index";

const FLOW_OPTIONS: { value: TransactionFlow | "all"; label: string }[] = [
  { value: "all",      label: "All"      },
  { value: "INFLOW",   label: "Inflow"   },
  { value: "OUTFLOW",  label: "Outflow"  },
  { value: "TRANSFER", label: "Transfer" },
];

const BUDGET_TYPE_OPTIONS: { value: BudgetType | "all"; label: string }[] = [
  { value: "all",     label: "All Types" },
  { value: "INCOME",  label: "Income"    },
  { value: "NEED",    label: "Need"      },
  { value: "WANT",    label: "Want"      },
  { value: "SAVINGS", label: "Savings"   },
];

interface ActiveFilters {
  flow?:       TransactionFlow;
  budgetType?: BudgetType;
  search:      string;
}

export function TransactionsPage() {
  const { period, prevMonth, nextMonth, isCurrentMonth } = usePeriod();
  const [filters, setFilters] = useState<ActiveFilters>({ search: "" });

  const { transactions, loading, error, reload } = useTransactions(period, filters);

  const totalInflow   = transactions.filter((t) => t.transactionFlow === "INFLOW").reduce((s, t)   => s + t.amountSgd, 0);
  const totalOutflow  = transactions.filter((t) => t.transactionFlow === "OUTFLOW").reduce((s, t)  => s + t.amountSgd, 0);
  const totalTransfer = transactions.filter((t) => t.transactionFlow === "TRANSFER").reduce((s, t) => s + t.amountSgd, 0);
  const hasFilters    = !!(filters.flow ?? filters.budgetType ?? filters.search);

  return (
    <div className="space-y-6">
      {/* Period + summary strip */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={prevMonth}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/10">←</button>
          <span className="min-w-32 text-center text-sm font-semibold text-slate-200">
            {formatMonth(period.year, period.month)}
          </span>
          <button type="button" onClick={nextMonth} disabled={isCurrentMonth}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/10 disabled:opacity-30">→</button>
        </div>

        <SummaryPill label="Inflow"   value={formatCurrency(totalInflow)}   color="emerald" />
        <SummaryPill label="Outflow"  value={formatCurrency(totalOutflow)}  color="rose"    />
        <SummaryPill label="Transfer" value={formatCurrency(totalTransfer)} color="indigo"  />
        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
          <p className="text-xs text-slate-500">Shown</p>
          <p className="mt-0.5 font-bold tabular-nums text-slate-200">{transactions.length}</p>
        </div>
        <Link to="/transactions/new"
          className="ml-auto inline-flex items-center gap-2 self-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400">
          + Add Transaction
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-4">
        <label className="sr-only" htmlFor="txn-search">Search transactions</label>
        <input id="txn-search" type="search" placeholder="Search description…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="min-w-48 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />

        <fieldset className="flex gap-1" aria-label="Filter by flow">
          {FLOW_OPTIONS.map((o) => (
            <button key={o.value} type="button"
              onClick={() => setFilters((f) => ({ ...f, flow: o.value === "all" ? undefined : o.value as TransactionFlow }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                (filters.flow ?? "all") === o.value ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}>
              {o.label}
            </button>
          ))}
        </fieldset>

        <fieldset className="flex gap-1" aria-label="Filter by budget type">
          {BUDGET_TYPE_OPTIONS.map((o) => (
            <button key={o.value} type="button"
              onClick={() => setFilters((f) => ({ ...f, budgetType: o.value === "all" ? undefined : o.value as BudgetType }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                (filters.budgetType ?? "all") === o.value ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}>
              {o.label}
            </button>
          ))}
        </fieldset>

        {hasFilters && (
          <button type="button" onClick={() => setFilters({ search: "" })}
            className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-300">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {(() => {
        const loader = <PageLoader loading={loading} error={error} onRetry={reload} />;
        if (loader) return loader;
        return <TransactionTable transactions={transactions} />;
      })()}
    </div>
  );
}

function SummaryPill({ label, value, color }: { label: string; value: string; color: "emerald" | "rose" | "indigo" }) {
  const cls = {
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    rose:    "border-rose-500/20    bg-rose-500/5    text-rose-400",
    indigo:  "border-indigo-500/20  bg-indigo-500/5  text-indigo-400",
  }[color];
  return (
    <div className={`rounded-xl border px-4 py-2.5 ${cls}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-bold tabular-nums">{value}</p>
    </div>
  );
}
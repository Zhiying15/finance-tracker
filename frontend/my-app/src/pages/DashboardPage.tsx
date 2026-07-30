import { Link } from "react-router";
import { StatCard }         from "@components/ui/StatCard";
import { ProgressBar }      from "@components/ui/ProgressBar";
import { TransactionTable } from "@components/ui/TransactionTable";
import { PageLoader }       from "@components/ui/PageLoader";
import { usePeriod }        from "@hooks/usePeriod";
import { useMonthlySummary, useTransactions } from "@hooks/useTransactions";
import { useBudgetSummary } from "@hooks/useBudget";
import { useNetWorth }      from "@hooks/useAccounts";
import { formatCurrency, formatMonth } from "@lib/mock-data";

export function DashboardPage() {
  const { period, prevMonth, nextMonth, isCurrentMonth } = usePeriod();

  const summaryAsync = useMonthlySummary(period);
  const budgetAsync  = useBudgetSummary(period);
  const worthAsync   = useNetWorth();
  const { transactions, loading: txnLoading } = useTransactions(period);

  const anyLoading = summaryAsync.loading || budgetAsync.loading || worthAsync.loading;
  const anyError   = summaryAsync.error ?? budgetAsync.error ?? worthAsync.error;

  const loader = <PageLoader loading={anyLoading} error={anyError}
    onRetry={() => { summaryAsync.reload(); budgetAsync.reload(); worthAsync.reload(); }} />;
  if (loader) return loader;

  const summary    = summaryAsync.data!;
  const b          = budgetAsync.data!;
  const worth      = worthAsync.data!;
  const monthLabel = formatMonth(period.year, period.month);
  const savingsRatePct = b.effectiveIncome > 0
    ? ((b.savingsActual / b.effectiveIncome) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={prevMonth}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white">
          ←
        </button>
        <span className="min-w-36 text-center text-sm font-semibold text-slate-200">{monthLabel}</span>
        <button type="button" onClick={nextMonth} disabled={isCurrentMonth}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-30">
          →
        </button>
      </div>

      {/* KPI Row */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key metrics</h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Net Worth"       value={formatCurrency(worth.netWorth)}       sub={`as of ${worth.asOf}`} icon="◈" glow="indigo" />
          <StatCard label="Monthly Inflow"  value={formatCurrency(summary.totalInflow)}  sub={monthLabel}            icon="↑" glow="emerald" />
          <StatCard label="Monthly Outflow" value={formatCurrency(summary.totalOutflow)} sub={monthLabel}            icon="↓" glow="rose" />
          <StatCard label="Spare Cash"      value={formatCurrency(b.spareCash)}          sub={`${savingsRatePct}% savings rate`} icon="◎" glow="amber" />
        </div>
      </section>

      {/* Budget Actuals + Monthly Flow */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="actual-budget-heading" className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
          <h2 id="actual-budget-heading" className="mb-6 font-semibold text-white">
            Budget Actuals
            <span className="ml-2 text-sm font-normal text-slate-500">{monthLabel}</span>
          </h2>
          <div className="space-y-6">
            <ProgressBar label={`Needs (${b.config.needPercent}%)`}
              actual={b.needActual} target={b.needTarget}
              formattedActual={formatCurrency(b.needActual)} formattedTarget={formatCurrency(b.needTarget)}
              color="indigo" />
            <ProgressBar label={`Wants (${b.config.wantPercent}%)`}
              actual={b.wantActual} target={b.wantTarget}
              formattedActual={formatCurrency(b.wantActual)} formattedTarget={formatCurrency(b.wantTarget)}
              color="amber" />
            <ProgressBar label={`Savings (${b.config.savingsPercent}%)`}
              actual={b.savingsActual} target={b.savingsTarget}
              formattedActual={formatCurrency(b.savingsActual)} formattedTarget={formatCurrency(b.savingsTarget)}
              color="emerald" />
          </div>
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-300">Spare Cash</span>
              <span className="font-bold tabular-nums text-amber-400">{formatCurrency(b.spareCash)}</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Income − (Needs + Wants + Savings)</p>
          </div>
        </section>

        <section aria-labelledby="flow-summary-heading" className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
          <h2 id="flow-summary-heading" className="mb-6 font-semibold text-white">
            Monthly Flow
            <span className="ml-2 text-sm font-normal text-slate-500">{monthLabel}</span>
          </h2>
          <div className="space-y-3">
            {([
              { label: "Total Inflow",   value: summary.totalInflow,   color: "text-emerald-400" },
              { label: "Total Outflow",  value: summary.totalOutflow,  color: "text-rose-400"    },
              { label: "Total Transfer", value: summary.totalTransfer, color: "text-indigo-400"  },
              { label: "Net Flow",       value: summary.netFlow,       color: summary.netFlow >= 0 ? "text-emerald-400" : "text-rose-400" },
            ] as const).map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between border-b border-white/[0.04] py-2.5 last:border-0">
                <span className="text-sm text-slate-400">{label}</span>
                <span className={`font-semibold tabular-nums ${color}`}>{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">By Budget Type</p>
            {(Object.entries(summary.byBudgetType) as [string, number][]).map(([type, amount]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{type}</span>
                <span className="text-xs font-medium tabular-nums text-slate-300">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Transactions */}
      <section aria-labelledby="recent-txn-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-txn-heading" className="font-semibold text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-sm text-indigo-400 transition hover:text-indigo-300 hover:underline underline-offset-2">
            View all →
          </Link>
        </div>
        {txnLoading
          ? <PageLoader loading={true} error={null} />
          : <TransactionTable transactions={transactions.slice(0, 5)} paginated={false} hiddenColumns={["source"]} />
        }
      </section>
    </div>
  );
}
import { StatCard } from "@components/ui/StatCard";
import { ProgressBar } from "@components/ui/ProgressBar";
import { MOCK_SUMMARY, MOCK_TRANSACTIONS, formatCurrency } from "@lib/mock-data";

export function BudgetPage() {
  const { budget, forecast } = MOCK_SUMMARY;

  // Derive category-level breakdown from transactions
  const needTxns    = MOCK_TRANSACTIONS.filter((t) => t.category?.bucket === "need");
  const wantTxns    = MOCK_TRANSACTIONS.filter((t) => t.category?.bucket === "want");
  const savingsTxns = MOCK_TRANSACTIONS.filter((t) => t.category?.bucket === "savings");

  const needsTarget    = budget.totalInflow * 0.5;
  const wantsTarget    = budget.totalInflow * 0.3;
  const savingsTarget  = budget.totalInflow * 0.2;

  return (
    <div className="space-y-8">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Inflow"    value={formatCurrency(budget.totalInflow)}  glow="emerald" icon="↑" />
        <StatCard label="Needs Spent"     value={formatCurrency(budget.needs)}         glow="indigo"  icon="◈" />
        <StatCard label="Wants Spent"     value={formatCurrency(budget.wants)}         glow="amber"   icon="◎" />
        <StatCard label="Savings"         value={formatCurrency(budget.savings)}       glow="rose"    icon="↗" />
      </div>

      {/* Spare Cash hero */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-500/70">Spare Cash</p>
        <p className="mt-2 text-5xl font-bold tabular-nums text-amber-400">
          {formatCurrency(budget.spareCash)}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {formatCurrency(budget.totalInflow)} inflow &minus; (
          {formatCurrency(budget.needs)} needs +{" "}
          {formatCurrency(budget.wants)} wants +{" "}
          {formatCurrency(budget.savings)} savings)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Actual vs Target */}
        <section
          aria-labelledby="budget-actual-heading"
          className="rounded-2xl border border-white/5 bg-slate-900/60 p-6"
        >
          <h2 id="budget-actual-heading" className="mb-6 font-semibold text-white">
            Actual vs Target
            <span className="ml-2 text-sm font-normal text-slate-500">50 / 30 / 20 rule</span>
          </h2>
          <div className="space-y-6">
            <ProgressBar label="Needs (50%)"   actual={budget.needs}   target={needsTarget}   formattedActual={formatCurrency(budget.needs)}   formattedTarget={formatCurrency(needsTarget)}   color="indigo"  />
            <ProgressBar label="Wants (30%)"   actual={budget.wants}   target={wantsTarget}   formattedActual={formatCurrency(budget.wants)}   formattedTarget={formatCurrency(wantsTarget)}   color="amber"   />
            <ProgressBar label="Savings (20%)" actual={budget.savings} target={savingsTarget} formattedActual={formatCurrency(budget.savings)} formattedTarget={formatCurrency(savingsTarget)} color="emerald" />
          </div>
        </section>

        {/* Forecast */}
        <section
          aria-labelledby="budget-forecast-heading"
          className="rounded-2xl border border-white/5 bg-slate-900/60 p-6"
        >
          <h2 id="budget-forecast-heading" className="mb-6 font-semibold text-white">
            Next Month Forecast
            <span className="ml-2 text-sm font-normal text-slate-500">July 2025</span>
          </h2>
          <div className="space-y-6">
            <ProgressBar label="Projected Needs"    actual={forecast.projectedNeeds}   target={forecast.projectedInflow * 0.5} formattedActual={formatCurrency(forecast.projectedNeeds)}   formattedTarget={formatCurrency(forecast.projectedInflow * 0.5)} color="indigo"  />
            <ProgressBar label="Projected Wants"    actual={forecast.projectedWants}   target={forecast.projectedInflow * 0.3} formattedActual={formatCurrency(forecast.projectedWants)}   formattedTarget={formatCurrency(forecast.projectedInflow * 0.3)} color="amber"   />
            <ProgressBar label="Projected Savings"  actual={forecast.projectedSavings} target={forecast.projectedInflow * 0.2} formattedActual={formatCurrency(forecast.projectedSavings)} formattedTarget={formatCurrency(forecast.projectedInflow * 0.2)} color="emerald" />
          </div>
          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-300">Projected Spare Cash</span>
              <span className="font-bold tabular-nums text-indigo-400">{formatCurrency(forecast.projectedSpareCash)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Per-bucket transaction breakdown */}
      {[
        { label: "Needs",   txns: needTxns,    color: "text-indigo-400"  },
        { label: "Wants",   txns: wantTxns,    color: "text-amber-400"   },
        { label: "Savings", txns: savingsTxns, color: "text-emerald-400" },
      ].map(({ label, txns, color }) => (
        <section
          key={label}
          aria-labelledby={`bucket-${label}-heading`}
          className="rounded-2xl border border-white/5 bg-slate-900/60 p-6"
        >
          <h2 id={`bucket-${label}-heading`} className={`mb-4 font-semibold ${color}`}>
            {label}
            <span className="ml-2 text-sm font-normal text-slate-500">
              {txns.length} transaction{txns.length !== 1 ? "s" : ""}
            </span>
          </h2>
          {txns.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions in this bucket.</p>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {txns.map((txn) => (
                <li key={txn.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-slate-200">{txn.description}</p>
                    <p className="text-xs text-slate-500">{txn.category?.name} · {txn.date}</p>
                  </div>
                  <span className="font-semibold tabular-nums text-rose-400">
                    −{formatCurrency(txn.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

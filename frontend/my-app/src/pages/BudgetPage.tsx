import { StatCard } from "@components/ui/StatCard";
import { ProgressBar } from "@components/ui/ProgressBar";
import { MOCK_TRANSACTIONS, MOCK_BUDGET_SUMMARY, formatCurrency, formatMonth } from "@lib/mock-data";
import type { BudgetType } from "@type/index";

export function BudgetPage() {
  // TODO: replace with budgetApi.getSummary({ year, month })
  const b = MOCK_BUDGET_SUMMARY;

  const monthLabel = formatMonth(b.config.year, b.config.month);

  const buckets: {
    label:  string;
    type:   BudgetType;
    actual: number;
    target: number;
    pct:    number;
    color:  "indigo" | "amber" | "emerald";
  }[] = [
    { label: "Needs",   type: "NEED",    actual: b.needActual,    target: b.needTarget,    pct: b.config.needPercent,    color: "indigo"  },
    { label: "Wants",   type: "WANT",    actual: b.wantActual,    target: b.wantTarget,    pct: b.config.wantPercent,    color: "amber"   },
    { label: "Savings", type: "SAVINGS", actual: b.savingsActual, target: b.savingsTarget, pct: b.config.savingsPercent, color: "emerald" },
  ];

  return (
    <div className="space-y-8">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Effective Income" value={formatCurrency(b.effectiveIncome)} glow="emerald" icon="↑" />
        <StatCard label="Needs Spent"      value={formatCurrency(b.needActual)}      glow="indigo"  icon="◈" />
        <StatCard label="Wants Spent"      value={formatCurrency(b.wantActual)}      glow="amber"   icon="◎" />
        <StatCard label="Savings"          value={formatCurrency(b.savingsActual)}   glow="rose"    icon="↗" />
      </div>

      {/* Spare Cash hero */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-500/70">Spare Cash</p>
        <p className="mt-2 text-5xl font-bold tabular-nums text-amber-400">
          {formatCurrency(b.spareCash)}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {formatCurrency(b.effectiveIncome)} income &minus; (
          {formatCurrency(b.needActual)} needs +{" "}
          {formatCurrency(b.wantActual)} wants +{" "}
          {formatCurrency(b.savingsActual)} savings)
        </p>
        {b.config.declaredIncome && (
          <p className="mt-1 text-xs text-slate-600">
            Using declared income of {formatCurrency(b.config.declaredIncome)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Actual vs Target */}
        <section
          aria-labelledby="budget-actual-heading"
          className="rounded-2xl border border-white/5 bg-slate-900/60 p-6"
        >
          <h2 id="budget-actual-heading" className="mb-6 font-semibold text-white">
            Actual vs Target
            <span className="ml-2 text-sm font-normal text-slate-500">
              {b.config.needPercent}/{b.config.wantPercent}/{b.config.savingsPercent} rule
            </span>
          </h2>
          <div className="space-y-6">
            {buckets.map((bkt) => (
              <ProgressBar
                key={bkt.type}
                label={`${bkt.label} (${bkt.pct}%)`}
                actual={bkt.actual}
                target={bkt.target}
                formattedActual={formatCurrency(bkt.actual)}
                formattedTarget={formatCurrency(bkt.target)}
                color={bkt.color}
              />
            ))}
          </div>
        </section>

        {/* Budget config panel */}
        <section
          aria-labelledby="budget-config-heading"
          className="rounded-2xl border border-white/5 bg-slate-900/60 p-6"
        >
          <h2 id="budget-config-heading" className="mb-6 font-semibold text-white">
            Budget Configuration
            <span className="ml-2 text-sm font-normal text-slate-500">{monthLabel}</span>
          </h2>

          <div className="divide-y divide-white/[0.04]">
            {[
              { label: "Need %",          value: `${b.config.needPercent}%`    },
              { label: "Want %",          value: `${b.config.wantPercent}%`    },
              { label: "Savings %",       value: `${b.config.savingsPercent}%` },
              { label: "Declared Income", value: b.config.declaredIncome ? formatCurrency(b.config.declaredIncome) : "Auto (from actuals)" },
              { label: "Actual Income",   value: formatCurrency(b.actualIncome)    },
              { label: "Effective Income",value: formatCurrency(b.effectiveIncome) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-semibold tabular-nums text-slate-200">{value}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2.5 text-sm font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
          >
            {/* TODO: budgetApi.upsert({ year, month, needPercent, wantPercent, savingsPercent, declaredIncome }) */}
            Edit Budget Config
          </button>
        </section>
      </div>

      {/* Per-bucket transaction lists */}
      {buckets.map(({ label, type, color }) => {
        const txns = MOCK_TRANSACTIONS.filter((t) => t.budgetType === type);
        const textColor = { indigo: "text-indigo-400", amber: "text-amber-400", emerald: "text-emerald-400" }[color];

        return (
          <section
            key={type}
            aria-labelledby={`bucket-${type}-heading`}
            className="rounded-2xl border border-white/5 bg-slate-900/60 p-6"
          >
            <h2 id={`bucket-${type}-heading`} className={`mb-4 font-semibold ${textColor}`}>
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
                      <p className="text-xs text-slate-500">
                        {txn.currencyCode !== "SGD"
                          ? `${txn.currencyCode} ${txn.amount.toLocaleString()} · `
                          : ""}
                        {txn.transactionDate}
                      </p>
                    </div>
                    <span className={`font-semibold tabular-nums ${textColor}`}>
                      {formatCurrency(txn.amountSgd)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
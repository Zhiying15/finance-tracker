import { Link } from "react-router";
import { StatCard } from "@components/ui/StatCard";
import { ProgressBar } from "@components/ui/ProgressBar";
import { TransactionTable } from "@components/ui/TransactionTable";
import { MOCK_SUMMARY, MOCK_TRANSACTIONS, formatCurrency } from "@lib/mock-data";

export function DashboardPage() {
  const { budget, forecast, totalAssets } = MOCK_SUMMARY;
  const recent = MOCK_TRANSACTIONS.slice(0, 5);

  const savingsRate = ((budget.savings / budget.totalInflow) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* KPI Row */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key metrics</h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            label="Total Assets"
            value={formatCurrency(totalAssets)}
            sub="All accounts combined"
            icon="◈"
            glow="indigo"
          />
          <StatCard
            label="Monthly Inflow"
            value={formatCurrency(budget.totalInflow)}
            sub="June 2025"
            icon="↑"
            glow="emerald"
            trend={{ value: "+12.4%", positive: true }}
          />
          <StatCard
            label="Monthly Outflow"
            value={formatCurrency(budget.totalOutflow)}
            sub="June 2025"
            icon="↓"
            glow="rose"
            trend={{ value: "−3.1%", positive: true }}
          />
          <StatCard
            label="Spare Cash"
            value={formatCurrency(budget.spareCash)}
            sub={`${savingsRate}% savings rate`}
            icon="◎"
            glow="amber"
          />
        </div>
      </section>

      {/* Budget + Forecast */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Actual Budget */}
        <section
          aria-labelledby="actual-budget-heading"
          className="rounded-2xl border border-white/5 bg-slate-900/60 p-6"
        >
          <h2 id="actual-budget-heading" className="mb-6 font-semibold text-white">
            Actual Budget
            <span className="ml-2 text-sm font-normal text-slate-500">June 2025</span>
          </h2>
          <div className="space-y-6">
            <ProgressBar
              label="Needs"
              actual={budget.needs}
              target={budget.totalInflow * 0.5}
              formattedActual={formatCurrency(budget.needs)}
              formattedTarget={formatCurrency(budget.totalInflow * 0.5)}
              color="indigo"
            />
            <ProgressBar
              label="Wants"
              actual={budget.wants}
              target={budget.totalInflow * 0.3}
              formattedActual={formatCurrency(budget.wants)}
              formattedTarget={formatCurrency(budget.totalInflow * 0.3)}
              color="amber"
            />
            <ProgressBar
              label="Savings"
              actual={budget.savings}
              target={budget.totalInflow * 0.2}
              formattedActual={formatCurrency(budget.savings)}
              formattedTarget={formatCurrency(budget.totalInflow * 0.2)}
              color="emerald"
            />
          </div>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-300">Spare Cash</span>
              <span className="font-bold tabular-nums text-amber-400">
                {formatCurrency(budget.spareCash)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Inflow − (Needs + Wants + Savings)
            </p>
          </div>
        </section>

        {/* Forecasted Budget */}
        <section
          aria-labelledby="forecast-budget-heading"
          className="rounded-2xl border border-white/5 bg-slate-900/60 p-6"
        >
          <h2 id="forecast-budget-heading" className="mb-6 font-semibold text-white">
            Forecasted Budget
            <span className="ml-2 text-sm font-normal text-slate-500">July 2025</span>
          </h2>
          <div className="space-y-6">
            <ProgressBar
              label="Projected Needs"
              actual={forecast.projectedNeeds}
              target={forecast.projectedInflow * 0.5}
              formattedActual={formatCurrency(forecast.projectedNeeds)}
              formattedTarget={formatCurrency(forecast.projectedInflow * 0.5)}
              color="indigo"
            />
            <ProgressBar
              label="Projected Wants"
              actual={forecast.projectedWants}
              target={forecast.projectedInflow * 0.3}
              formattedActual={formatCurrency(forecast.projectedWants)}
              formattedTarget={formatCurrency(forecast.projectedInflow * 0.3)}
              color="amber"
            />
            <ProgressBar
              label="Projected Savings"
              actual={forecast.projectedSavings}
              target={forecast.projectedInflow * 0.2}
              formattedActual={formatCurrency(forecast.projectedSavings)}
              formattedTarget={formatCurrency(forecast.projectedInflow * 0.2)}
              color="emerald"
            />
          </div>

          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-300">Projected Spare Cash</span>
              <span className="font-bold tabular-nums text-indigo-400">
                {formatCurrency(forecast.projectedSpareCash)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Based on rolling 3-month average
            </p>
          </div>
        </section>
      </div>

      {/* Recent Transactions */}
      <section aria-labelledby="recent-txn-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-txn-heading" className="font-semibold text-white">
            Recent Transactions
          </h2>
          {/* ✅ Fixed: was <a href> — now uses React Router <Link> */}
          <Link
            to="/transactions"
            className="text-sm text-indigo-400 transition hover:text-indigo-300 hover:underline underline-offset-2"
          >
            View all →
          </Link>
        </div>
        <TransactionTable
          transactions={recent}
          paginated={false}
          hiddenColumns={["source"]}
        />
      </section>
    </div>
  );
}

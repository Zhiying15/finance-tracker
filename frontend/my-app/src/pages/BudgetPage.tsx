import { useState } from "react";
import { StatCard }         from "@components/ui/StatCard";
import { ProgressBar }      from "@components/ui/ProgressBar";
import { PageLoader }       from "@components/ui/PageLoader";
import { usePeriod }        from "@hooks/usePeriod";
import { useBudgetSummary } from "@hooks/useBudget";
import { useTransactions }  from "@hooks/useTransactions";
import { budgetApi, normaliseError } from "@api/index";
import { formatCurrency, formatMonth } from "@lib/mock-data";
import type { BudgetType } from "@api/index";

export function BudgetPage() {
  const { period, prevMonth, nextMonth, isCurrentMonth } = usePeriod();
  const budgetAsync = useBudgetSummary(period);
  const { transactions, loading: txnLoading } = useTransactions(period);

  const [editingConfig, setEditingConfig] = useState(false);
  const [configForm, setConfigForm]       = useState({ needPercent: "", wantPercent: "", savingsPercent: "", declaredIncome: "" });
  const [configSaving, setConfigSaving]   = useState(false);
  const [configError, setConfigError]     = useState<string | null>(null);

  async function saveConfig() {
    setConfigSaving(true);
    setConfigError(null);
    try {
      await budgetApi.upsert({
        year:           period.year,
        month:          period.month,
        needPercent:    configForm.needPercent    ? Number(configForm.needPercent)    : undefined,
        wantPercent:    configForm.wantPercent    ? Number(configForm.wantPercent)    : undefined,
        savingsPercent: configForm.savingsPercent ? Number(configForm.savingsPercent) : undefined,
        declaredIncome: configForm.declaredIncome ? Number(configForm.declaredIncome) : undefined,
      });
      budgetAsync.reload();
      setEditingConfig(false);
    } catch (err) {
      setConfigError(normaliseError(err));
    } finally {
      setConfigSaving(false);
    }
  }

  const loader = <PageLoader loading={budgetAsync.loading} error={budgetAsync.error} onRetry={budgetAsync.reload} />;
  if (loader) return loader;

  const b          = budgetAsync.data!;
  const monthLabel = formatMonth(period.year, period.month);

  const buckets: { label: string; type: BudgetType; actual: number; target: number; pct: number; color: "indigo" | "amber" | "emerald" }[] = [
    { label: "Needs",   type: "NEED",    actual: b.needActual,    target: b.needTarget,    pct: b.config.needPercent,    color: "indigo"  },
    { label: "Wants",   type: "WANT",    actual: b.wantActual,    target: b.wantTarget,    pct: b.config.wantPercent,    color: "amber"   },
    { label: "Savings", type: "SAVINGS", actual: b.savingsActual, target: b.savingsTarget, pct: b.config.savingsPercent, color: "emerald" },
  ];

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={prevMonth}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/10">←</button>
        <span className="min-w-36 text-center text-sm font-semibold text-slate-200">{monthLabel}</span>
        <button type="button" onClick={nextMonth} disabled={isCurrentMonth}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/10 disabled:opacity-30">→</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Effective Income" value={formatCurrency(b.effectiveIncome)} glow="emerald" icon="↑" />
        <StatCard label="Needs Spent"      value={formatCurrency(b.needActual)}      glow="indigo"  icon="◈" />
        <StatCard label="Wants Spent"      value={formatCurrency(b.wantActual)}      glow="amber"   icon="◎" />
        <StatCard label="Savings"          value={formatCurrency(b.savingsActual)}   glow="rose"    icon="↗" />
      </div>

      {/* Spare Cash hero */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-500/70">Spare Cash</p>
        <p className="mt-2 text-5xl font-bold tabular-nums text-amber-400">{formatCurrency(b.spareCash)}</p>
        <p className="mt-2 text-sm text-slate-500">
          {formatCurrency(b.effectiveIncome)} income − ({formatCurrency(b.needActual)} needs + {formatCurrency(b.wantActual)} wants + {formatCurrency(b.savingsActual)} savings)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Actual vs Target */}
        <section aria-labelledby="budget-actual-heading" className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
          <h2 id="budget-actual-heading" className="mb-6 font-semibold text-white">
            Actual vs Target
            <span className="ml-2 text-sm font-normal text-slate-500">{b.config.needPercent}/{b.config.wantPercent}/{b.config.savingsPercent} rule</span>
          </h2>
          <div className="space-y-6">
            {buckets.map((bkt) => (
              <ProgressBar key={bkt.type}
                label={`${bkt.label} (${bkt.pct}%)`}
                actual={bkt.actual} target={bkt.target}
                formattedActual={formatCurrency(bkt.actual)} formattedTarget={formatCurrency(bkt.target)}
                color={bkt.color} />
            ))}
          </div>
        </section>

        {/* Config panel */}
        <section aria-labelledby="budget-config-heading" className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
          <h2 id="budget-config-heading" className="mb-6 font-semibold text-white">
            Budget Configuration
            <span className="ml-2 text-sm font-normal text-slate-500">{monthLabel}</span>
          </h2>

          {!editingConfig ? (
            <>
              <div className="divide-y divide-white/[0.04]">
                {[
                  { label: "Need %",           value: `${b.config.needPercent}%`    },
                  { label: "Want %",           value: `${b.config.wantPercent}%`    },
                  { label: "Savings %",        value: `${b.config.savingsPercent}%` },
                  { label: "Declared Income",  value: b.config.declaredIncome ? formatCurrency(b.config.declaredIncome) : "Auto (from actuals)" },
                  { label: "Actual Income",    value: formatCurrency(b.actualIncome)    },
                  { label: "Effective Income", value: formatCurrency(b.effectiveIncome) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-semibold tabular-nums text-slate-200">{value}</span>
                  </div>
                ))}
              </div>
              <button type="button"
                onClick={() => {
                  setConfigForm({ needPercent: String(b.config.needPercent), wantPercent: String(b.config.wantPercent), savingsPercent: String(b.config.savingsPercent), declaredIncome: b.config.declaredIncome ? String(b.config.declaredIncome) : "" });
                  setEditingConfig(true);
                }}
                className="mt-6 w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2.5 text-sm font-semibold text-indigo-400 transition hover:bg-indigo-500/20">
                Edit Budget Config
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {[
                { key: "needPercent",    label: "Need %",    placeholder: "50" },
                { key: "wantPercent",    label: "Want %",    placeholder: "30" },
                { key: "savingsPercent", label: "Savings %", placeholder: "20" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">{label}</label>
                  <input type="number" min="0" max="100" step="1" placeholder={placeholder}
                    value={configForm[key as keyof typeof configForm]}
                    onChange={(e) => setConfigForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Declared Income (optional)</label>
                <input type="number" min="0" step="0.01" placeholder="Leave blank to use actuals"
                  value={configForm.declaredIncome}
                  onChange={(e) => setConfigForm((f) => ({ ...f, declaredIncome: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              {configError && <p role="alert" className="text-sm text-rose-400">{configError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingConfig(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10">Cancel</button>
                <button type="button" disabled={configSaving} onClick={saveConfig}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60">
                  {configSaving ? "Saving…" : "Save Config"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Per-bucket breakdowns */}
      {!txnLoading && buckets.map(({ label, type, color }) => {
        const txns      = transactions.filter((t) => t.budgetType === type);
        const textColor = { indigo: "text-indigo-400", amber: "text-amber-400", emerald: "text-emerald-400" }[color];
        return (
          <section key={type} aria-labelledby={`bucket-${type}-heading`} className="rounded-2xl border border-white/5 bg-slate-900/60 p-6">
            <h2 id={`bucket-${type}-heading`} className={`mb-4 font-semibold ${textColor}`}>
              {label}
              <span className="ml-2 text-sm font-normal text-slate-500">{txns.length} transaction{txns.length !== 1 ? "s" : ""}</span>
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
                        {txn.currencyCode !== "SGD" ? `${txn.currencyCode} ${txn.amount.toLocaleString()} · ` : ""}
                        {txn.transactionDate}
                      </p>
                    </div>
                    <span className={`font-semibold tabular-nums ${textColor}`}>{formatCurrency(txn.amountSgd)}</span>
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
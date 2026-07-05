import { useState } from "react";
import { useNavigate } from "react-router";
import type { TransactionFlow, BudgetType } from "@api/index";

// ─── Static option lists ──────────────────────────────────────────────────────
// TODO: replace budget type labels with dataDictionaryApi.getGroup("BUDGET_TYPE")

const FLOW_OPTIONS: { value: TransactionFlow; label: string; color: string }[] = [
  { value: "INFLOW",   label: "↑ Inflow",   color: "emerald" },
  { value: "OUTFLOW",  label: "↓ Outflow",  color: "rose"    },
  { value: "TRANSFER", label: "⇄ Transfer", color: "indigo"  },
];

interface BudgetTypeOption {
  value: BudgetType;
  label: string;
  flows: TransactionFlow[];
}

const BUDGET_TYPE_OPTIONS: BudgetTypeOption[] = [
  { value: "INCOME",  label: "Income",  flows: ["INFLOW"]             },
  { value: "NEED",    label: "Need",    flows: ["OUTFLOW"]            },
  { value: "WANT",    label: "Want",    flows: ["OUTFLOW"]            },
  { value: "SAVINGS", label: "Savings", flows: ["OUTFLOW", "TRANSFER"] },
];

const CURRENCIES = ["SGD", "USD", "EUR", "GBP", "JPY", "MYR", "AUD", "HKD", "CNY", "THB"];

const TODAY = new Date().toISOString().split("T")[0] as string;

interface FormState {
  transactionFlow: TransactionFlow;
  transactionDate: string;
  description:     string;
  amount:          string;
  currencyCode:    string;
  exchangeRate:    string;
  budgetType:      BudgetType | "";
  fromAccountId:   string;
  toAccountId:     string;
  isRecurring:     boolean;
  remarks:         string;
}

const INITIAL: FormState = {
  transactionFlow: "OUTFLOW",
  transactionDate: TODAY,
  description:     "",
  amount:          "",
  currencyCode:    "SGD",
  exchangeRate:    "1",
  budgetType:      "",
  fromAccountId:   "",
  toAccountId:     "",
  isRecurring:     false,
  remarks:         "",
};

export function AddTransactionPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  const isForeignCurrency    = form.currencyCode !== "SGD";
  const availableBudgetTypes = BUDGET_TYPE_OPTIONS.filter((o) =>
    o.flows.includes(form.transactionFlow),
  );

  const amountSgdPreview = isForeignCurrency && form.amount && form.exchangeRate
    ? (Number(form.amount) * Number(form.exchangeRate)).toFixed(2)
    : null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleFlowChange(flow: TransactionFlow) {
    setForm((f) => ({ ...f, transactionFlow: flow, budgetType: "" }));
    setErrors({});
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.description.trim())
      e.description = "Description is required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a valid positive amount";
    if (!form.transactionDate)
      e.transactionDate = "Date is required";
    if (form.transactionFlow !== "TRANSFER" && !form.budgetType)
      e.budgetType = "Select a budget type";
    if (isForeignCurrency && (!form.exchangeRate || Number(form.exchangeRate) <= 0))
      e.exchangeRate = "Enter a valid exchange rate";
    if ((form.transactionFlow === "OUTFLOW" || form.transactionFlow === "TRANSFER") && !form.fromAccountId)
      e.fromAccountId = "Select a source account";
    if ((form.transactionFlow === "INFLOW" || form.transactionFlow === "TRANSFER") && !form.toAccountId)
      e.toAccountId = "Select a destination account";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    // TODO: replace with real API call:
    // const body: Api.Transactions.CreateRequest = {
    //   transactionFlow: form.transactionFlow,
    //   transactionDate: form.transactionDate,
    //   description:     form.description,
    //   amount:          Number(form.amount),
    //   currencyCode:    form.currencyCode,
    //   exchangeRate:    Number(form.exchangeRate),
    //   budgetType:      form.budgetType || undefined,
    //   fromAccountId:   form.fromAccountId ? Number(form.fromAccountId) : undefined,
    //   toAccountId:     form.toAccountId   ? Number(form.toAccountId)   : undefined,
    //   isRecurring:     form.isRecurring,
    //   remarks:         form.remarks       || undefined,
    // };
    // await transactionsApi.create(body);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    navigate("/transactions");
  }

  const flowColorMap = { INFLOW: "emerald", OUTFLOW: "rose", TRANSFER: "indigo" } as const;
  const flowColor    = flowColorMap[form.transactionFlow];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Flow selector */}
      <div role="group" aria-label="Transaction direction" className="grid grid-cols-3 gap-2 rounded-2xl border border-white/5 bg-slate-900/60 p-2">
        {FLOW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleFlowChange(opt.value)}
            className={`rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
              form.transactionFlow === opt.value
                ? opt.color === "emerald" ? "bg-emerald-500/20 text-emerald-300 shadow-inner"
                : opt.color === "rose"    ? "bg-rose-500/20    text-rose-300    shadow-inner"
                :                          "bg-indigo-500/20   text-indigo-300  shadow-inner"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="space-y-5 rounded-2xl border border-white/5 bg-slate-900/60 p-6">
        {/* Date + Amount */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" error={errors.transactionDate}>
            <input
              type="date" value={form.transactionDate} max={TODAY}
              onChange={(e) => set("transactionDate", e.target.value)}
              className={inputCls(!!errors.transactionDate)}
            />
          </Field>
          <Field label="Amount" error={errors.amount}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                {form.currencyCode}
              </span>
              <input
                type="number" min="0.01" step="0.01" placeholder="0.00"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className={`${inputCls(!!errors.amount)} pl-12`}
              />
            </div>
          </Field>
        </div>

        {/* Currency + Exchange rate */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Currency">
            <select
              value={form.currencyCode}
              onChange={(e) => { set("currencyCode", e.target.value); if (e.target.value === "SGD") set("exchangeRate", "1"); }}
              className={inputCls(false)}
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Exchange Rate (to SGD)" error={errors.exchangeRate}>
            <input
              type="number" min="0.000001" step="0.0001" placeholder="1.0000"
              value={form.exchangeRate} disabled={!isForeignCurrency}
              onChange={(e) => set("exchangeRate", e.target.value)}
              className={`${inputCls(!!errors.exchangeRate)} disabled:cursor-not-allowed disabled:opacity-40`}
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description" error={errors.description}>
          <input
            type="text" placeholder="e.g. June Salary, NTUC Groceries…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputCls(!!errors.description)}
          />
        </Field>

        {/* From account */}
        {(form.transactionFlow === "OUTFLOW" || form.transactionFlow === "TRANSFER") && (
          <Field label="From Account" error={errors.fromAccountId}>
            <select
              value={form.fromAccountId}
              onChange={(e) => set("fromAccountId", e.target.value)}
              className={inputCls(!!errors.fromAccountId)}
            >
              <option value="">Select source account…</option>
              {/* TODO: accountsApi.list() */}
              <option value="1">DBS Multiplier (SGD)</option>
              <option value="2">OCBC 360 (SGD)</option>
            </select>
          </Field>
        )}

        {/* To account */}
        {(form.transactionFlow === "INFLOW" || form.transactionFlow === "TRANSFER") && (
          <Field label="To Account" error={errors.toAccountId}>
            <select
              value={form.toAccountId}
              onChange={(e) => set("toAccountId", e.target.value)}
              className={inputCls(!!errors.toAccountId)}
            >
              <option value="">Select destination account…</option>
              {/* TODO: accountsApi.list() */}
              <option value="1">DBS Multiplier (SGD)</option>
              <option value="3">CPF Ordinary Account (SGD)</option>
            </select>
          </Field>
        )}

        {/* Budget type */}
        {form.transactionFlow !== "TRANSFER" && (
          <Field label="Budget Type" error={errors.budgetType}>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Budget type">
              {availableBudgetTypes.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("budgetType", opt.value)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                    form.budgetType === opt.value
                      ? flowColor === "emerald" ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                      : flowColor === "rose"    ? "border-rose-500/40    bg-rose-500/20    text-rose-300"
                      :                          "border-indigo-500/40   bg-indigo-500/20  text-indigo-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
        )}

        {/* Recurring */}
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox" checked={form.isRecurring}
            onChange={(e) => set("isRecurring", e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-indigo-500"
          />
          <span className="text-sm text-slate-300">Recurring transaction</span>
        </label>

        {/* Remarks */}
        <Field label="Remarks (optional)">
          <textarea
            rows={2} placeholder="Any additional notes…"
            value={form.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            className={`${inputCls(false)} resize-none`}
          />
        </Field>
      </div>

      {/* SGD preview */}
      {amountSgdPreview && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-sm">
          <span className="text-slate-400">SGD equivalent: </span>
          <span className="font-bold text-indigo-400">SGD {amountSgdPreview}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button" onClick={() => navigate(-1)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="button" disabled={saving} onClick={handleSubmit}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 disabled:opacity-60 ${
            form.transactionFlow === "INFLOW"   ? "bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-500"
          : form.transactionFlow === "TRANSFER" ? "bg-indigo-600  shadow-indigo-500/20  hover:bg-indigo-500"
          :                                       "bg-rose-600    shadow-rose-500/20    hover:bg-rose-500"
          }`}
        >
          {saving ? "Saving…" : `Save ${form.transactionFlow.charAt(0) + form.transactionFlow.slice(1).toLowerCase()}`}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-slate-200",
    "placeholder-slate-600 transition focus:outline-none focus:ring-1",
    hasError
      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500"
      : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500",
  ].join(" ");
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
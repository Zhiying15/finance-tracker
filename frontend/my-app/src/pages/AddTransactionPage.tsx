import { useState } from "react";
import { useNavigate } from "react-router";
import { MOCK_CATEGORIES } from "@lib/mock-data";
import type { TransactionFlow } from "@type/index";

interface FormState {
  flow:        TransactionFlow;
  date:        string;
  description: string;
  amount:      string;
  categoryId:  string;
  notes:       string;
}

const TODAY = new Date().toISOString().split("T")[0];

const INITIAL: FormState = {
  flow:        "outflow",
  date:        TODAY,
  description: "",
  amount:      "",
  categoryId:  "",
  notes:       "",
};

export function AddTransactionPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState<FormState>(INITIAL);
  const [errors, setErrors]   = useState<Partial<FormState>>({});
  const [saving, setSaving]   = useState(false);

  const filteredCategories = MOCK_CATEGORIES.filter((c) => c.flow === form.flow);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = "Enter a valid positive amount";
    if (!form.categoryId) e.categoryId = "Select a category";
    if (!form.date) e.date = "Select a date";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    // TODO: replace with API call → api.post("/transactions", { ...form, amount: Number(form.amount) })
    await new Promise((r) => setTimeout(r, 800)); // simulate network
    setSaving(false);
    navigate("/transactions");
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      {/* Flow Toggle */}
      <div
        role="group"
        aria-label="Transaction direction"
        className="grid grid-cols-2 gap-2 rounded-2xl border border-white/5 bg-slate-900/60 p-2"
      >
        {(["outflow", "inflow"] as TransactionFlow[]).map((flow) => (
          <button
            key={flow}
            type="button"
            onClick={() => { set("flow", flow); set("categoryId", ""); }}
            className={`rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
              form.flow === flow
                ? flow === "inflow"
                  ? "bg-emerald-500/20 text-emerald-300 shadow-inner"
                  : "bg-rose-500/20 text-rose-300 shadow-inner"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {flow === "inflow" ? "↑ Inflow" : "↓ Outflow"}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="space-y-5 rounded-2xl border border-white/5 bg-slate-900/60 p-6">
        {/* Date + Amount row */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" error={errors.date}>
            <input
              type="date"
              value={form.date}
              max={TODAY}
              onChange={(e) => set("date", e.target.value)}
              className={inputCls(!!errors.date)}
            />
          </Field>

          <Field label="Amount (SGD)" error={errors.amount}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                $
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                className={`${inputCls(!!errors.amount)} pl-7`}
              />
            </div>
          </Field>
        </div>

        {/* Description */}
        <Field label="Description" error={errors.description}>
          <input
            type="text"
            placeholder="e.g. Monthly Salary, NTUC Groceries…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputCls(!!errors.description)}
          />
        </Field>

        {/* Category */}
        <Field label="Category" error={errors.categoryId}>
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className={inputCls(!!errors.categoryId)}
          >
            <option value="">Select a category…</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        {/* Notes */}
        <Field label="Notes (optional)">
          <textarea
            rows={3}
            placeholder="Any additional context…"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={`${inputCls(false)} resize-none`}
          />
        </Field>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 disabled:opacity-60 ${
            form.flow === "inflow"
              ? "bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-500"
              : "bg-indigo-600 shadow-indigo-500/20 hover:bg-indigo-500"
          }`}
        >
          {saving ? "Saving…" : `Save ${form.flow === "inflow" ? "Inflow" : "Outflow"}`}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-slate-200",
    "placeholder-slate-600 transition",
    "focus:outline-none focus:ring-1",
    hasError
      ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500"
      : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500",
  ].join(" ");
}

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

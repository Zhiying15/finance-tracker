import { useState } from "react";
import type { Api, AssetClass } from "@api/index";
import { StatCard } from "@components/ui/StatCard";
import { EmptyState } from "@components/ui/EmptyState";
import { Drawer } from "@components/ui/Drawer";
import {
  MOCK_ACCOUNTS,
  MOCK_ACCOUNT_TYPES,
  MOCK_NET_WORTH,
  formatCurrency,
} from "@lib/mock-data";

type Account     = Api.Accounts.Account;
type AccountType = Api.Accounts.AccountType;

// ─── Asset class display config ───────────────────────────────────────────────

const ASSET_CLASS_META: Record<AssetClass, { label: string; color: string; dot: string }> = {
  CASH:         { label: "Cash & Banking",    color: "text-emerald-400", dot: "bg-emerald-400" },
  FIXED_INCOME: { label: "Fixed Income",      color: "text-indigo-400",  dot: "bg-indigo-400"  },
  EQUITY:       { label: "Equity",            color: "text-blue-400",    dot: "bg-blue-400"    },
  REAL_ESTATE:  { label: "Real Estate",       color: "text-amber-400",   dot: "bg-amber-400"   },
  COMMODITY:    { label: "Commodities",       color: "text-orange-400",  dot: "bg-orange-400"  },
  CRYPTO:       { label: "Crypto",            color: "text-purple-400",  dot: "bg-purple-400"  },
  OTHER:        { label: "Other",             color: "text-slate-400",   dot: "bg-slate-400"   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByAssetClass(accounts: Account[]): Map<AssetClass, Account[]> {
  const map = new Map<AssetClass, Account[]>();
  for (const acc of accounts) {
    const cls = (acc.accountType?.assetClass ?? "OTHER") as AssetClass;
    if (!map.has(cls)) map.set(cls, []);
    map.get(cls)!.push(acc);
  }
  return map;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AccountsPage() {
  const [showInactive, setShowInactive]   = useState(false);
  const [selectedAcc, setSelectedAcc]     = useState<Account | null>(null);
  const [showCreateDrawer, setShowCreate] = useState(false);

  // TODO: replace with accountsApi.list(showInactive) + accountsApi.getNetWorth()
  const accounts = MOCK_ACCOUNTS
    .filter((a) => showInactive || a.isActive)
    .map((a) => ({ ...a, accountType: MOCK_ACCOUNT_TYPES.find((t) => t.id === a.accountTypeId) }));

  const worth  = MOCK_NET_WORTH;
  const groups = groupByAssetClass(accounts);

  const totalAssets      = accounts.filter((a) => a.accountType?.accountCategory === "ASSET").reduce((s, a) => s + a.currentBalance, 0);
  const totalLiabilities = accounts.filter((a) => a.accountType?.accountCategory === "LIABILITY").reduce((s, a) => s + Math.abs(a.currentBalance), 0);

  return (
    <div className="space-y-8">
      {/* Net Worth KPIs */}
      <section aria-labelledby="net-worth-heading">
        <h2 id="net-worth-heading" className="sr-only">Net worth overview</h2>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Net Worth"        value={formatCurrency(worth.netWorth)}        glow="indigo"  icon="◈" sub={`as of ${worth.asOf}`} />
          <StatCard label="Total Assets"     value={formatCurrency(totalAssets)}           glow="emerald" icon="↑" />
          <StatCard label="Total Liabilities" value={formatCurrency(totalLiabilities)}     glow="rose"    icon="↓" />
          <StatCard label="Active Accounts"  value={String(accounts.filter((a) => a.isActive).length)} glow="amber" icon="◎" />
        </div>
      </section>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-indigo-500"
          />
          Show inactive accounts
        </label>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
        >
          + Add Account
        </button>
      </div>

      {/* Account groups */}
      {accounts.length === 0 ? (
        <EmptyState
          icon="🏦"
          title="No accounts yet"
          description="Add your first account to start tracking your net worth."
          action={
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              + Add Account
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([cls, accs]) => {
            const meta      = ASSET_CLASS_META[cls];
            const groupTotal = accs.reduce((s, a) => s + a.currentBalance, 0);

            return (
              <section key={cls} aria-labelledby={`group-${cls}`}>
                {/* Group header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
                    <h2 id={`group-${cls}`} className={`text-sm font-semibold ${meta.color}`}>
                      {meta.label}
                    </h2>
                    <span className="text-xs text-slate-600">({accs.length})</span>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${meta.color}`}>
                    {formatCurrency(groupTotal)}
                  </span>
                </div>

                {/* Account rows */}
                <div className="overflow-hidden rounded-2xl border border-white/5">
                  {accs.map((acc, idx) => (
                    <AccountRow
                      key={acc.id}
                      account={acc}
                      isLast={idx === accs.length - 1}
                      onSelect={() => setSelectedAcc(acc)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Account detail drawer */}
      <AccountDetailDrawer
        account={selectedAcc}
        onClose={() => setSelectedAcc(null)}
      />

      {/* Create account drawer */}
      <CreateAccountDrawer
        accountTypes={MOCK_ACCOUNT_TYPES}
        open={showCreateDrawer}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}

// ─── AccountRow ───────────────────────────────────────────────────────────────

function AccountRow({
  account: acc,
  isLast,
  onSelect,
}: {
  account: Account;
  isLast: boolean;
  onSelect: () => void;
}) {
  const isLiability = acc.accountType?.accountCategory === "LIABILITY";
  const balanceColor = isLiability
    ? "text-rose-400"
    : acc.currentBalance >= 0 ? "text-slate-200" : "text-rose-400";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full items-center gap-4 bg-slate-900/40 px-5 py-4 text-left transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-indigo-500/50 ${
        !isLast ? "border-b border-white/[0.04]" : ""
      } ${!acc.isActive ? "opacity-50" : ""}`}
    >
      {/* Account type icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg">
        {accountIcon(acc.accountType?.assetClass)}
      </div>

      {/* Name + institution */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-slate-200">{acc.name}</p>
          {!acc.isActive && (
            <span className="rounded-full bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              Inactive
            </span>
          )}
          {acc.manualValuation && (
            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-500">
              Manual
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {acc.institution ?? "—"}
          {acc.accountNumber ? ` · ${acc.accountNumber}` : ""}
          {acc.currencyCode !== "SGD" ? ` · ${acc.currencyCode}` : ""}
        </p>
      </div>

      {/* Balance */}
      <div className="text-right">
        <p className={`text-sm font-semibold tabular-nums ${balanceColor}`}>
          {isLiability && acc.currentBalance < 0 ? "−" : ""}
          {formatCurrency(Math.abs(acc.currentBalance), acc.currencyCode)}
        </p>
        {acc.lastValuationDate && (
          <p className="mt-0.5 text-xs text-slate-600">
            Valued {acc.lastValuationDate}
          </p>
        )}
      </div>

      <span aria-hidden="true" className="text-xs text-slate-700 group-hover:text-slate-500">→</span>
    </button>
  );
}

// ─── AccountDetailDrawer ──────────────────────────────────────────────────────

function AccountDetailDrawer({
  account: acc,
  onClose,
}: {
  account: Account | null;
  onClose: () => void;
}) {
  return (
    <Drawer open={acc !== null} onClose={onClose} title="Account Detail" width="md">
      {acc && (
        <div className="space-y-6">
          {/* Balance hero */}
          <div className={`rounded-2xl border p-6 text-center ${
            (acc.accountType?.accountCategory === "LIABILITY")
              ? "border-rose-500/20 bg-rose-500/10"
              : "border-emerald-500/20 bg-emerald-500/10"
          }`}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {acc.accountType?.name ?? "Account"} · {acc.currencyCode}
            </p>
            <p className={`text-4xl font-bold tabular-nums ${
              acc.accountType?.accountCategory === "LIABILITY" ? "text-rose-400" : "text-emerald-400"
            }`}>
              {formatCurrency(Math.abs(acc.currentBalance), acc.currencyCode)}
            </p>
            <p className="mt-1 text-sm text-slate-500">{acc.name}</p>
          </div>

          {/* Detail rows */}
          <div className="divide-y divide-white/[0.04] rounded-2xl border border-white/5 bg-slate-900/60 px-5">
            {[
              { label: "Institution",       value: acc.institution ?? "—"         },
              { label: "Account Number",    value: acc.accountNumber ?? "—"       },
              { label: "Currency",          value: acc.currencyCode               },
              { label: "Opening Balance",   value: formatCurrency(acc.openingBalance, acc.currencyCode) },
              { label: "Current Balance",   value: formatCurrency(acc.currentBalance, acc.currencyCode) },
              { label: "Asset Class",       value: acc.accountType?.assetClass ?? "—"    },
              { label: "Category",          value: acc.accountType?.accountCategory ?? "—" },
              { label: "Include in Net Worth", value: acc.includeInNetWorth ? "Yes" : "No" },
              { label: "Manual Valuation",  value: acc.manualValuation ? "Yes" : "No" },
              ...(acc.lastValuationDate ? [{ label: "Last Valued", value: acc.lastValuationDate }] : []),
              { label: "Status",            value: acc.isActive ? "Active" : "Inactive" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-200">{String(value)}</span>
              </div>
            ))}
          </div>

          {acc.notes && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Notes</p>
              <p className="text-sm leading-relaxed text-slate-300">{acc.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Close
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Edit
              {/* TODO: accountsApi.update(acc.id, body) */}
            </button>
          </div>

          {acc.isActive && (
            <button
              type="button"
              className="w-full rounded-xl border border-rose-500/20 bg-rose-500/5 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"
            >
              Deactivate Account
              {/* TODO: accountsApi.deactivate(acc.id) */}
            </button>
          )}
        </div>
      )}
    </Drawer>
  );
}

// ─── CreateAccountDrawer ──────────────────────────────────────────────────────

function CreateAccountDrawer({
  accountTypes,
  open,
  onClose,
}: {
  accountTypes: AccountType[];
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    accountTypeId:    "",
    name:             "",
    institution:      "",
    accountNumber:    "",
    currencyCode:     "SGD",
    openingBalance:   "",
    manualValuation:  false,
    includeInNetWorth: true,
    notes:            "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.accountTypeId)    e.accountTypeId  = "Select an account type";
    if (!form.name.trim())      e.name           = "Name is required";
    if (!form.currencyCode)     e.currencyCode   = "Currency is required";
    if (form.openingBalance === "" || isNaN(Number(form.openingBalance)))
      e.openingBalance = "Enter a valid opening balance";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    // TODO: await accountsApi.create({ accountTypeId: Number(form.accountTypeId), ... })
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    onClose();
  }

  const inputCls = (hasErr: boolean) =>
    `w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition focus:outline-none focus:ring-1 ${
      hasErr ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500"
             : "border-white/10 focus:border-indigo-500 focus:ring-indigo-500"
    }`;

  return (
    <Drawer open={open} onClose={onClose} title="Add Account" width="md">
      <div className="space-y-5">
        {/* Account type */}
        <Field label="Account Type" error={errors.accountTypeId}>
          <select value={form.accountTypeId} onChange={(e) => set("accountTypeId", e.target.value)} className={inputCls(!!errors.accountTypeId)}>
            <option value="">Select type…</option>
            {accountTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>

        {/* Name */}
        <Field label="Account Name" error={errors.name}>
          <input type="text" placeholder="e.g. DBS Multiplier" value={form.name}
            onChange={(e) => set("name", e.target.value)} className={inputCls(!!errors.name)} />
        </Field>

        {/* Institution */}
        <Field label="Institution">
          <input type="text" placeholder="e.g. DBS, OCBC, CPF Board" value={form.institution}
            onChange={(e) => set("institution", e.target.value)} className={inputCls(false)} />
        </Field>

        {/* Account number */}
        <Field label="Account Number (last 4 digits)">
          <input type="text" placeholder="**** 1234" value={form.accountNumber}
            onChange={(e) => set("accountNumber", e.target.value)} className={inputCls(false)} />
        </Field>

        {/* Currency + Opening balance */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Currency">
            <select value={form.currencyCode} onChange={(e) => set("currencyCode", e.target.value)} className={inputCls(false)}>
              {["SGD","USD","EUR","GBP","JPY","MYR","AUD","HKD"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Opening Balance" error={errors.openingBalance}>
            <input type="number" step="0.01" placeholder="0.00" value={form.openingBalance}
              onChange={(e) => set("openingBalance", e.target.value)} className={inputCls(!!errors.openingBalance)} />
          </Field>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-300">Include in Net Worth</p>
              <p className="text-xs text-slate-500">Count this balance in your total net worth</p>
            </div>
            <input type="checkbox" checked={form.includeInNetWorth}
              onChange={(e) => set("includeInNetWorth", e.target.checked)}
              className="h-4 w-4 accent-indigo-500" />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-300">Manual Valuation</p>
              <p className="text-xs text-slate-500">For property, unlisted assets — update balance manually</p>
            </div>
            <input type="checkbox" checked={form.manualValuation}
              onChange={(e) => set("manualValuation", e.target.checked)}
              className="h-4 w-4 accent-indigo-500" />
          </label>
        </div>

        {/* Notes */}
        <Field label="Notes (optional)">
          <textarea rows={2} placeholder="Any notes…" value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={`${inputCls(false)} resize-none`} />
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
            Cancel
          </button>
          <button type="button" disabled={saving} onClick={handleSave}
            className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-60">
            {saving ? "Saving…" : "Add Account"}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function accountIcon(assetClass?: string): string {
  const map: Record<string, string> = {
    CASH: "🏦", FIXED_INCOME: "📄", EQUITY: "📈",
    REAL_ESTATE: "🏠", COMMODITY: "🪙", CRYPTO: "₿", OTHER: "💼",
  };
  return map[assetClass ?? ""] ?? "💼";
}
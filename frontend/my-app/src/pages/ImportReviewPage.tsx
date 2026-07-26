import { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import type { Api, ImportReviewStatus, BudgetType } from "@api/index";
import { Drawer } from "@components/ui/Drawer";
import { EmptyState } from "@components/ui/EmptyState";
import { MOCK_UPLOADS, MOCK_IMPORT_ROWS, formatCurrency } from "@lib/mock-data";

type ImportRow        = Api.Import.ImportRow;

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_META: Record<ImportReviewStatus, { label: string; cls: string; dot: string }> = {
  NEW:      { label: "Pending",  cls: "bg-indigo-500/10  text-indigo-400",  dot: "bg-indigo-400"  },
  APPROVED: { label: "Approved", cls: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
  REJECTED: { label: "Rejected", cls: "bg-slate-500/10   text-slate-400",   dot: "bg-slate-500"   },
  ERROR:    { label: "Error",    cls: "bg-rose-500/10    text-rose-400",    dot: "bg-rose-400"    },
};

const BUDGET_TYPE_OPTIONS: { value: BudgetType; label: string }[] = [
  { value: "INCOME",  label: "Income"  },
  { value: "NEED",    label: "Need"    },
  { value: "WANT",    label: "Want"    },
  { value: "SAVINGS", label: "Savings" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ImportReviewPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const numericFileId = Number(fileId);

  // TODO: replace with importApi.getFile(numericFileId) + importApi.getRows(numericFileId)
  const file = MOCK_UPLOADS.find((f) => f.id === numericFileId) ?? MOCK_UPLOADS[1];
  const [rows, setRows] = useState<ImportRow[]>(MOCK_IMPORT_ROWS);

  const [editingRow, setEditingRow]   = useState<ImportRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<ImportReviewStatus | "all">("all");
  const [saving, setSaving]           = useState<number | null>(null);
  const [bulkWorking, setBulkWorking] = useState(false);

  const filtered = useMemo(() =>
    statusFilter === "all" ? rows : rows.filter((r) => r.status === statusFilter),
  [rows, statusFilter]);

  const counts = useMemo(() => ({
    NEW:      rows.filter((r) => r.status === "NEW").length,
    APPROVED: rows.filter((r) => r.status === "APPROVED").length,
    REJECTED: rows.filter((r) => r.status === "REJECTED").length,
    ERROR:    rows.filter((r) => r.status === "ERROR").length,
  }), [rows]);

  // ── Row actions ─────────────────────────────────────────────────────────────

  async function approveRow(rowId: number) {
    setSaving(rowId);
    // TODO: await importApi.approveRow(numericFileId, rowId, accountId)
    await new Promise((r) => setTimeout(r, 500));
    setRows((prev) => prev.map((r) => r.id === rowId ? { ...r, status: "APPROVED" as ImportReviewStatus } : r));
    setSaving(null);
  }

  async function rejectRow(rowId: number) {
    setSaving(rowId);
    // TODO: await importApi.rejectRow(numericFileId, rowId)
    await new Promise((r) => setTimeout(r, 500));
    setRows((prev) => prev.map((r) => r.id === rowId ? { ...r, status: "REJECTED" as ImportReviewStatus } : r));
    setSaving(null);
  }

  async function bulkApprove() {
    setBulkWorking(true);
    // TODO: await importApi.bulkApprove(numericFileId, accountId)
    await new Promise((r) => setTimeout(r, 800));
    setRows((prev) => prev.map((r) => r.status === "NEW" ? { ...r, status: "APPROVED" as ImportReviewStatus } : r));
    setBulkWorking(false);
  }

  async function bulkReject() {
    setBulkWorking(true);
    // TODO: await importApi.bulkReject(numericFileId)
    await new Promise((r) => setTimeout(r, 800));
    setRows((prev) => prev.map((r) => r.status === "NEW" ? { ...r, status: "REJECTED" as ImportReviewStatus } : r));
    setBulkWorking(false);
  }

  function saveEdit(updated: ImportRow) {
    setRows((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    setEditingRow(null);
    // TODO: await importApi.updateRow(numericFileId, updated.id, { ...updated })
  }

  return (
    <div className="space-y-6">
      {/* File header */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-slate-900/60 p-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">📊</span>
            <div>
              <p className="font-semibold text-white">{file.filename}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Uploaded {new Intl.DateTimeFormat("en-SG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(file.uploadedAt))}
              </p>
            </div>
          </div>
        </div>

        {/* Row count badges */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(counts) as [ImportReviewStatus, number][]).map(([status, count]) => {
            const meta = STATUS_META[status];
            return (
              <span key={status} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
                {count} {meta.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Bulk actions + filter */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status filter */}
        <div className="flex gap-1" role="group" aria-label="Filter by status">
          {([
            { value: "all",      label: "All"      },
            { value: "NEW",      label: "Pending"  },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
            { value: "ERROR",    label: "Error"    },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === opt.value
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Bulk actions — only shown when NEW rows exist */}
        {counts.NEW > 0 && (
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              disabled={bulkWorking}
              onClick={bulkReject}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-60"
            >
              {bulkWorking ? "Working…" : `Reject all (${counts.NEW})`}
            </button>
            <button
              type="button"
              disabled={bulkWorking}
              onClick={bulkApprove}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {bulkWorking ? "Working…" : `Approve all (${counts.NEW})`}
            </button>
          </div>
        )}
      </div>

      {/* Review table */}
      {filtered.length === 0 ? (
        <EmptyState icon="✅" title="No rows to show" description="Try a different filter." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Import rows for review">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Date</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Description</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Budget Type</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-widest text-slate-500">Amount</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((row) => {
                  const statusMeta = STATUS_META[row.status];
                  const isSaving   = saving === row.id;
                  const isNew      = row.status === "NEW" || row.status === "ERROR";

                  return (
                    <tr key={row.id} className="bg-slate-900/30 transition-colors hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-slate-400">
                        {row.transactionDate}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="max-w-[220px] truncate text-slate-200">{row.description}</p>
                        {row.errorMessage && (
                          <p className="mt-0.5 text-xs text-rose-400">{row.errorMessage}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {row.budgetType ? (
                          <span className="rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-300">
                            {row.budgetType}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <span className={`font-semibold tabular-nums ${row.isInflow ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.isInflow ? "+" : "−"}{formatCurrency(row.amount, row.currency)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusMeta.cls}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} aria-hidden="true" />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit — always available */}
                          <button
                            type="button"
                            onClick={() => setEditingRow(row)}
                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
                          >
                            Edit
                          </button>

                          {/* Approve / Reject — only for NEW + ERROR */}
                          {isNew && (
                            <>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => rejectRow(row.id)}
                                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                              >
                                {isSaving ? "…" : "Reject"}
                              </button>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => approveRow(row.id)}
                                className="rounded-lg bg-emerald-600/80 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                              >
                                {isSaving ? "…" : "Approve"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Done — link back when all processed */}
      {counts.NEW === 0 && counts.ERROR === 0 && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <p className="text-2xl">✅</p>
          <p className="mt-3 font-semibold text-emerald-400">All rows reviewed</p>
          <p className="mt-1 text-sm text-slate-500">
            {counts.APPROVED} approved · {counts.REJECTED} rejected
          </p>
          <Link
            to="/upload"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            ← Back to Uploads
          </Link>
        </div>
      )}

      {/* Edit row drawer */}
      <EditRowDrawer
        row={editingRow}
        onClose={() => setEditingRow(null)}
        onSave={saveEdit}
      />
    </div>
  );
}

// ─── EditRowDrawer ────────────────────────────────────────────────────────────

function EditRowDrawer({
  row,
  onClose,
  onSave,
}: {
  row: ImportRow | null;
  onClose: () => void;
  onSave: (updated: ImportRow) => void;
}) {
  const [form, setForm] = useState<ImportRow | null>(null);

  // Sync form when row changes
  if (row && form?.id !== row.id) setForm({ ...row });

  if (!form) return null;

  function set<K extends keyof ImportRow>(key: K, value: ImportRow[K]) {
    setForm((f) => f ? { ...f, [key]: value } : f);
  }

  const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <Drawer open={row !== null} onClose={onClose} title="Edit Import Row" width="md">
      {form && (
        <div className="space-y-5">
          {/* Direction toggle */}
          <div role="group" aria-label="Transaction direction" className="grid grid-cols-2 gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-1.5">
            {[
              { label: "↑ Inflow",  value: true  },
              { label: "↓ Outflow", value: false },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => set("isInflow", opt.value)}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  form.isInflow === opt.value
                    ? opt.value
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/20 text-rose-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <input type="date" value={form.transactionDate}
                onChange={(e) => set("transactionDate", e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Amount">
              <input type="number" min="0.01" step="0.01" value={form.amount}
                onChange={(e) => set("amount", Number(e.target.value))}
                className={inputCls} />
            </Field>
          </div>

          <Field label="Description">
            <input type="text" value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputCls} />
          </Field>

          <Field label="Currency">
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls}>
              {["SGD","USD","EUR","GBP","JPY","MYR","AUD","HKD"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Budget Type">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Budget type">
              {BUDGET_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("budgetType", opt.value)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    form.budgetType === opt.value
                      ? "border-indigo-500/40 bg-indigo-500/20 text-indigo-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
              Cancel
            </button>
            <button type="button" onClick={() => onSave(form)}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}
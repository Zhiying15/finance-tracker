import { Drawer } from "./Drawer";
import { CategoryBadge } from "./CategoryBadge";
import { formatCurrency, formatDate } from "@lib/mock-data";
import type { Transaction } from "@type/index";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
}

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

import type { ReactNode } from "react";

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-200 text-right">{value}</span>
    </div>
  );
}

export function TransactionDetailDrawer({ transaction: txn, onClose }: TransactionDetailDrawerProps) {
  return (
    <Drawer
      open={txn !== null}
      onClose={onClose}
      title="Transaction Detail"
      width="md"
    >
      {txn && (
        <div className="space-y-6">
          {/* Hero amount */}
          <div className={`rounded-2xl p-6 text-center ${
            txn.flow === "inflow"
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-rose-500/10 border border-rose-500/20"
          }`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              {txn.flow === "inflow" ? "Inflow" : "Outflow"}
            </p>
            <p className={`text-4xl font-bold tabular-nums ${
              txn.flow === "inflow" ? "text-emerald-400" : "text-rose-400"
            }`}>
              {txn.flow === "inflow" ? "+" : "−"}{formatCurrency(txn.amount)}
            </p>
            <p className="mt-2 text-sm text-slate-400">{txn.description}</p>
          </div>

          {/* Detail rows */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 px-5 divide-y divide-white/[0.04]">
            <DetailRow label="Date" value={formatDate(txn.date)} />
            <DetailRow
              label="Category"
              value={
                txn.category ? (
                  <CategoryBadge
                    name={txn.category.name}
                    color={txn.category.color}
                    flow={txn.flow}
                    bucket={txn.category.bucket}
                    size="sm"
                  />
                ) : "—"
              }
            />
            <DetailRow
              label="Budget Bucket"
              value={
                <span className="capitalize">
                  {txn.category?.bucket ?? "—"}
                </span>
              }
            />
            <DetailRow
              label="Source"
              value={
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  txn.source === "upload"
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "bg-slate-500/10 text-slate-400"
                }`}>
                  {txn.source ?? "manual"}
                </span>
              }
            />
            {txn.uploadBatchId && (
              <DetailRow label="Upload Batch" value={txn.uploadBatchId} />
            )}
            <DetailRow label="Transaction ID" value={
              <span className="font-mono text-xs text-slate-500">{txn.id}</span>
            } />
          </div>

          {/* Notes */}
          {txn.notes && (
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Notes</p>
              <p className="text-sm text-slate-300 leading-relaxed">{txn.notes}</p>
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
              onClick={() => {
                // TODO: navigate to edit page when backend is wired
                // navigate(`/transactions/${txn.id}/edit`)
              }}
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
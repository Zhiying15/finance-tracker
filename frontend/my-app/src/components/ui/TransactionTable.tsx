import { useState, useMemo } from "react";
import { CategoryBadge } from "./CategoryBadge";
import { SortableHeader, useSortState } from "./SortableHeader";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { TransactionDetailDrawer } from "./TransactionDetailDrawer";
import { formatCurrency, formatDate } from "@lib/mock-data";
import type { Transaction } from "@type/index";
import { Link } from "react-router";

interface TransactionTableProps {
  transactions: Transaction[];
  /** Show pagination controls. Default: true */
  paginated?: boolean;
  /** Default rows per page. Default: 10 */
  defaultPageSize?: number;
  /** Hide columns by field name */
  hiddenColumns?: Array<"date" | "description" | "category" | "amount" | "source">;
}

// type SortableField = "date" | "description" | "amount";

export function TransactionTable({
  transactions,
  paginated = true,
  defaultPageSize = 10,
  hiddenColumns = [],
}: TransactionTableProps) {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(defaultPageSize);
  const { sortField, sortDir, handleSort } = useSortState("date", "desc");

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortField || !sortDir) return [...transactions];
    return [...transactions].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = a.date.localeCompare(b.date);
      } else if (sortField === "amount") {
        cmp = a.amount - b.amount;
      } else if (sortField === "description") {
        cmp = a.description.localeCompare(b.description);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [transactions, sortField, sortDir]);

  // ── Paginate ──────────────────────────────────────────────────────────────
  const paginated_data = useMemo(() => {
    if (!paginated) return sorted;
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, paginated, page, pageSize]);

  // Reset to page 1 when data changes
  const total = transactions.length;

  if (total === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No transactions yet"
        description="Add one manually or upload a bank statement to get started."
        action={
          <Link
            to="/transactions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            + Add Transaction
          </Link>
        }
      />
    );
  }

  const show = (col: string) => !hiddenColumns.includes(col as never);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/5">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Transactions">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                {show("date") && (
                  <SortableHeader
                    label="Date"
                    field="date"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                )}
                {show("description") && (
                  <SortableHeader
                    label="Description"
                    field="description"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                )}
                {show("category") && (
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Category
                  </th>
                )}
                {show("amount") && (
                  <SortableHeader
                    label="Amount"
                    field="amount"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    align="right"
                  />
                )}
                {show("source") && (
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Source
                  </th>
                )}
                {/* Actions column */}
                <th className="px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {paginated_data.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => setSelectedTxn(txn)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View detail for ${txn.description}`}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedTxn(txn)}
                  className="cursor-pointer bg-slate-900/30 outline-none transition-colors duration-100 hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-indigo-500/50"
                >
                  {show("date") && (
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-400">
                      {formatDate(txn.date)}
                    </td>
                  )}

                  {show("description") && (
                    <td className="max-w-[240px] px-6 py-4">
                      <p className="truncate text-slate-200">{txn.description}</p>
                    </td>
                  )}

                  {show("category") && (
                    <td className="px-6 py-4">
                      {txn.category ? (
                        <CategoryBadge
                          name={txn.category.name}
                          color={txn.category.color}
                          flow={txn.flow}
                          bucket={txn.category.bucket}
                          size="sm"
                        />
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                  )}

                  {show("amount") && (
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span
                        className={`font-semibold tabular-nums ${
                          txn.flow === "inflow" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {txn.flow === "inflow" ? "+" : "−"}
                        {formatCurrency(txn.amount)}
                      </span>
                    </td>
                  )}

                  {show("source") && (
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          txn.source === "upload"
                            ? "bg-indigo-500/10 text-indigo-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {txn.source ?? "manual"}
                      </span>
                    </td>
                  )}

                  <td className="px-4 py-4 text-right">
                    <span
                      aria-hidden="true"
                      className="text-xs text-slate-600 group-hover:text-slate-400"
                    >
                      →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginated && total > pageSize && (
          <div className="border-t border-white/5 bg-white/[0.01] px-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <TransactionDetailDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </>
  );
}
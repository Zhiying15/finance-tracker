interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from       = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to         = Math.min(page * pageSize, total);

  const pages = buildPageNumbers(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1 py-4 text-sm">
      {/* Count */}
      <p className="text-slate-500">
        {total === 0 ? "No results" : `${from}–${to} of ${total}`}
      </p>

      <div className="flex items-center gap-3">
        {/* Page size picker */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-xs text-slate-500">
              Rows
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1); // reset to first page
              }}
              className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Page buttons */}
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <PaginationBtn
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            ←
          </PaginationBtn>

          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-600">
                …
              </span>
            ) : (
              <PaginationBtn
                key={p}
                onClick={() => onPageChange(p as number)}
                active={p === page}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </PaginationBtn>
            ),
          )}

          <PaginationBtn
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            →
          </PaginationBtn>
        </nav>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PaginationBtnProps {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page" | undefined;
}

function PaginationBtn({
  onClick,
  disabled,
  active,
  children,
  ...ariaProps
}: PaginationBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...ariaProps}
      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? "bg-indigo-500 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Helper — build page number array with ellipsis ──────────────────────────

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");
  pages.push(total);

  return pages;
}
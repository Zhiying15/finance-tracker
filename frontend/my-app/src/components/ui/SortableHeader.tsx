import { useState, useCallback } from "react";

export type SortDirection = "asc" | "desc" | null;

interface SortableHeaderProps {
  label: string;
  field: string;
  sortField: string | null;
  sortDir: SortDirection;
  onSort: (field: string) => void;
  align?: "left" | "right";
}

export function SortableHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
  align = "left",
}: SortableHeaderProps) {
  const isActive = sortField === field;
  const indicator = isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕";

  return (
    <th
      className={`px-6 py-4 text-xs font-semibold uppercase tracking-widest ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        aria-sort={
          isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none"
        }
        className={`inline-flex items-center gap-1.5 transition-colors hover:text-white focus-visible:outline-none focus-visible:underline ${
          isActive ? "text-indigo-400" : "text-slate-500"
        }`}
      >
        {label}
        <span
          aria-hidden="true"
          className={`text-xs transition-opacity ${isActive ? "opacity-100" : "opacity-30"}`}
        >
          {indicator}
        </span>
      </button>
    </th>
  );
}

// ─── useSortState hook ────────────────────────────────────────────────────────

interface UseSortStateReturn {
  sortField: string | null;
  sortDir: SortDirection;
  handleSort: (field: string) => void;
}

export function useSortState(
  defaultField: string,
  defaultDir: SortDirection = "desc",
): UseSortStateReturn {
  const [sortField, setSortField] = useState<string | null>(defaultField);
  const [sortDir, setSortDir]     = useState<SortDirection>(defaultDir);

  const handleSort = useCallback((field: string) => {
    setSortField((prev) => {
      if (prev === field) {
        // Cycle: desc → asc → null → desc
        setSortDir((d) => (d === "desc" ? "asc" : d === "asc" ? null : "desc"));
        return prev;
      }
      setSortDir("desc");
      return field;
    });
  }, []);

  return { sortField, sortDir, handleSort };
}
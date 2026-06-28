import type { BudgetBucket, TransactionFlow } from "@type/index";

interface CategoryBadgeProps {
  name: string;
  color?: string;
  flow?: TransactionFlow;
  bucket?: BudgetBucket;
  size?: "sm" | "md";
}

const bucketLabel: Record<BudgetBucket, string> = {
  need:          "Need",
  want:          "Want",
  savings:       "Savings",
  uncategorised: "—",
};

export function CategoryBadge({
  name,
  color,
  flow,
  bucket,
  size = "md",
}: CategoryBadgeProps) {
  const dot = color ?? (flow === "inflow" ? "#10B981" : "#6366F1");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 font-medium text-slate-300 ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: dot }}
      />
      {name}
      {bucket && bucket !== "uncategorised" && (
        <span className="ml-0.5 text-slate-500">· {bucketLabel[bucket]}</span>
      )}
    </span>
  );
}
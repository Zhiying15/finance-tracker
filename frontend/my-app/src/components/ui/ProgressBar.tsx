interface ProgressBarProps {
  label: string;
  actual: number;
  target: number;
  formattedActual: string;
  formattedTarget: string;
  color?: "indigo" | "amber" | "emerald" | "rose";
}

const colorMap: Record<NonNullable<ProgressBarProps["color"]>, { bar: string; bg: string; text: string }> = {
  indigo:  { bar: "bg-indigo-500",  bg: "bg-indigo-500/10",  text: "text-indigo-400"  },
  amber:   { bar: "bg-amber-500",   bg: "bg-amber-500/10",   text: "text-amber-400"   },
  emerald: { bar: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  rose:    { bar: "bg-rose-500",    bg: "bg-rose-500/10",    text: "text-rose-400"    },
};

export function ProgressBar({
  label,
  actual,
  target,
  formattedActual,
  formattedTarget,
  color = "indigo",
}: ProgressBarProps) {
  const pct     = Math.min((actual / target) * 100, 100);
  const over    = actual > target;
  const c       = colorMap[color];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className={`font-semibold tabular-nums ${over ? "text-rose-400" : c.text}`}>
          {formattedActual}
          <span className="ml-1 font-normal text-slate-500">/ {formattedTarget}</span>
        </span>
      </div>

      <div className={`h-2 w-full overflow-hidden rounded-full ${c.bg}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${over ? "bg-rose-500" : c.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-right text-xs text-slate-500">
        {over
          ? `${(actual - target).toFixed(0)} over budget`
          : `${(pct).toFixed(0)}% used`}
      </p>
    </div>
  );
}
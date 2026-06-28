import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  glow?: "indigo" | "emerald" | "rose" | "amber";
  className?: string;
}

const glowMap: Record<NonNullable<StatCardProps["glow"]>, string> = {
  indigo: "shadow-indigo-500/10 border-indigo-500/20",
  emerald: "shadow-emerald-500/10 border-emerald-500/20",
  rose:    "shadow-rose-500/10    border-rose-500/20",
  amber:   "shadow-amber-500/10   border-amber-500/20",
};

const glowText: Record<NonNullable<StatCardProps["glow"]>, string> = {
  indigo: "text-indigo-400",
  emerald: "text-emerald-400",
  rose:    "text-rose-400",
  amber:   "text-amber-400",
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  glow = "indigo",
  className = "",
}: StatCardProps) {
  return (
    <article
      className={`
        relative overflow-hidden rounded-2xl border bg-slate-900/60
        p-6 shadow-lg backdrop-blur-sm transition-transform duration-200
        hover:-translate-y-0.5 hover:shadow-xl
        ${glowMap[glow]} ${className}
      `}
    >
      {/* Background radial bloom — signature design element */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-10 blur-2xl"
        style={{
          background: {
            indigo: "radial-gradient(circle, #6366F1, transparent)",
            emerald: "radial-gradient(circle, #10B981, transparent)",
            rose:    "radial-gradient(circle, #F43F5E, transparent)",
            amber:   "radial-gradient(circle, #F59E0B, transparent)",
          }[glow],
        }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">
            {label}
          </p>
          {icon && (
            <span className={`text-xl ${glowText[glow]}`} aria-hidden="true">
              {icon}
            </span>
          )}
        </div>

        <p className={`mt-3 text-3xl font-bold tracking-tight ${glowText[glow]}`}>
          {value}
        </p>

        <div className="mt-2 flex items-center gap-3">
          {sub && <span className="text-xs text-slate-500">{sub}</span>}
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                trend.positive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
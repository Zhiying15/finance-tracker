import { useState } from "react";
import { NavLink } from "react-router";

interface NavItem {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
  badge?: string;
}

const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Overview",
    items: [
      { to: "/",             icon: "▣",  label: "Dashboard",    end: true },
      { to: "/transactions", icon: "⇅",  label: "Transactions"            },
      { to: "/budget",       icon: "◉",  label: "Budget"                  },
    ],
  },
  {
    heading: "Tools",
    items: [
      { to: "/upload", icon: "↑", label: "Upload Statements" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="Main sidebar"
      className={`group/sidebar relative flex h-screen flex-shrink-0 flex-col border-r border-white/5 bg-slate-950 transition-all duration-300 ease-in-out ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Brand */}
      <div
        className={`flex h-[73px] flex-shrink-0 items-center border-b border-white/5 px-4 ${
          collapsed ? "justify-center" : "gap-3 px-5"
        }`}
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-lg font-bold text-indigo-400">
          ₣
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight text-white">FinTrack</p>
            <p className="text-xs text-slate-500">Personal Finance</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto overflow-x-hidden py-4"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="mb-4">
            {/* Group heading — hidden when collapsed */}
            {!collapsed && (
              <p className="mb-1 px-5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                {group.heading}
              </p>
            )}

            <ul className={`space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl transition-all duration-150 ${
                        collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"
                      } ${
                        isActive
                          ? "bg-indigo-500/15 text-indigo-300"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator bar */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-indigo-400"
                          />
                        )}

                        <span
                          aria-hidden="true"
                          className={`flex-shrink-0 text-base transition-transform duration-150 group-hover:scale-110 ${
                            isActive ? "text-indigo-400" : "text-slate-500"
                          }`}
                        >
                          {item.icon}
                        </span>

                        {!collapsed && (
                          <span className="flex-1 truncate text-sm font-medium">
                            {item.label}
                          </span>
                        )}

                        {!collapsed && item.badge && (
                          <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-xs font-semibold text-indigo-400">
                            {item.badge}
                          </span>
                        )}

                        {!collapsed && isActive && (
                          <span
                            aria-hidden="true"
                            className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400"
                          />
                        )}

                        {/* Tooltip when collapsed */}
                        {collapsed && (
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 opacity-0 shadow-xl transition-opacity group-hover:opacity-100"
                          >
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — user info */}
      <div
        className={`border-t border-white/5 p-3 ${
          collapsed ? "flex justify-center" : ""
        }`}
      >
        <div
          className={`flex items-center gap-3 rounded-xl px-2 py-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
            U
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-300">User</p>
              <p className="truncate text-xs text-slate-600">user@email.com</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-[84px] flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-xs text-slate-400 shadow-md transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {collapsed ? "›" : "‹"}
      </button>
    </aside>
  );
}
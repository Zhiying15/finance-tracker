import { useLocation, Link } from "react-router";
import { Breadcrumb, type BreadcrumbItem } from "@components/ui/Breadcrumb";

interface PageMeta {
  title:        string;
  description:  string;
  breadcrumbs:  BreadcrumbItem[];
  hideCta?:     boolean;
}

const PAGE_META: Record<string, PageMeta> = {
  "/": {
    title: "Dashboard",
    description: "Your financial overview for this month",
    breadcrumbs: [{ label: "Dashboard" }],
  },
  "/transactions": {
    title: "Transactions",
    description: "All inflow, outflow and transfer activity",
    breadcrumbs: [{ label: "Dashboard", to: "/" }, { label: "Transactions" }],
  },
  "/transactions/new": {
    title: "Add Transaction",
    description: "Record a new transaction manually",
    breadcrumbs: [
      { label: "Dashboard", to: "/" },
      { label: "Transactions", to: "/transactions" },
      { label: "Add New" },
    ],
    hideCta: true,
  },
  "/budget": {
    title: "Budget",
    description: "Needs · Wants · Savings breakdown",
    breadcrumbs: [{ label: "Dashboard", to: "/" }, { label: "Budget" }],
  },
  "/accounts": {
    title: "Accounts",
    description: "Manage your bank, CPF, investment and property accounts",
    breadcrumbs: [{ label: "Dashboard", to: "/" }, { label: "Accounts" }],
  },
  "/upload": {
    title: "Import Statements",
    description: "Upload bank statements — auto-categorised for review",
    breadcrumbs: [{ label: "Dashboard", to: "/" }, { label: "Import" }],
    hideCta: true,
  },
};

// Dynamic prefix matches for parameterised routes
const DYNAMIC_META: { prefix: string; meta: PageMeta }[] = [
  {
    prefix: "/upload/",
    meta: {
      title:       "Review Import",
      description: "Approve or reject each parsed transaction row",
      breadcrumbs: [
        { label: "Dashboard", to: "/" },
        { label: "Import",    to: "/upload" },
        { label: "Review" },
      ],
      hideCta: true,
    },
  },
  {
    prefix: "/transactions/",
    meta: {
      title:       "Transaction",
      description: "Transaction detail",
      breadcrumbs: [
        { label: "Dashboard",    to: "/" },
        { label: "Transactions", to: "/transactions" },
        { label: "Detail" },
      ],
      hideCta: true,
    },
  },
];

function resolveMeta(pathname: string): PageMeta {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  for (const { prefix, meta } of DYNAMIC_META) {
    if (pathname.startsWith(prefix)) return meta;
  }
  return {
    title: "Finance Tracker",
    description: "",
    breadcrumbs: [{ label: "Dashboard", to: "/" }],
  };
}

export function TopBar() {
  const { pathname } = useLocation();
  const meta = resolveMeta(pathname);

  const now = new Intl.DateTimeFormat("en-SG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date());

  return (
    <header className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-white/5 bg-slate-950/80 px-8 backdrop-blur-sm">
      <div className="min-w-0">
        {meta.breadcrumbs.length > 1 && <Breadcrumb items={meta.breadcrumbs} />}
        <h1 className={`font-bold tracking-tight text-white ${meta.breadcrumbs.length > 1 ? "mt-0.5 text-lg" : "text-xl"}`}>
          {meta.title}
        </h1>
      </div>

      <div className="flex flex-shrink-0 items-center gap-4">
        <time dateTime={new Date().toISOString()} className="hidden text-xs text-slate-600 lg:block">
          {now}
        </time>
        {!meta.hideCta && (
          <Link
            to="/transactions/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-150 hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span aria-hidden="true">+</span>
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Link>
        )}
      </div>
    </header>
  );
}
import { createBrowserRouter } from "react-router";
import { RootLayout } from "@components/layout/RootLayout";
import { ErrorBoundary } from "@components/ui/ErrorBoundary";
import { DashboardPage } from "@pages/DashboardPage";
import { TransactionsPage } from "@pages/TransactionsPage";
import { AddTransactionPage } from "@pages/AddTransactionPage";
import { BudgetPage } from "@pages/BudgetPage";
import { UploadPage } from "@pages/UploadPage";
import { NotFoundPage } from "@pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <RootLayout />
      </ErrorBoundary>
    ),
    // Inline error element for route-level errors (loader/action failures)
    errorElement: (
      <ErrorBoundary>
        <NotFoundPage />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "transactions",
        element: <TransactionsPage />,
      },
      {
        path: "transactions/new",
        element: <AddTransactionPage />,
      },
      {
        // Future: transactions/:id/edit — scaffold ready
        path: "transactions/:id",
        element: <TransactionsPage />, // placeholder — swap for TransactionDetailPage
      },
      {
        path: "budget",
        element: <BudgetPage />,
      },
      {
        path: "upload",
        element: <UploadPage />,
      },
    ],
  },
  // 404 catch-all — outside RootLayout so it renders full screen
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
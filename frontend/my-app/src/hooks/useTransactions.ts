import { useMemo } from "react";
import { transactionsApi } from "@api/index";
import { useAsync } from "./useAsync";
import type { Api, TransactionFlow, BudgetType } from "@api/index";

type Transaction     = Api.Transactions.Transaction;
type PeriodParams    = Api.Transactions.PeriodParams;

export interface TransactionFilters {
  flow?:       TransactionFlow;
  budgetType?: BudgetType;
  search?:     string;
}

export function useTransactions(period: PeriodParams, filters: TransactionFilters = {}) {
  const { data, loading, error, reload } = useAsync(
    () => transactionsApi.listByPeriod(period),
    [period.year, period.month],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((txn: Transaction) => {
      if (filters.flow       && txn.transactionFlow !== filters.flow)       return false;
      if (filters.budgetType && txn.budgetType      !== filters.budgetType) return false;
      if (filters.search && !txn.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [data, filters.flow, filters.budgetType, filters.search]);

  return { transactions: filtered, allTransactions: data ?? [], loading, error, reload };
}

export function useMonthlySummary(period: PeriodParams) {
  return useAsync(() => transactionsApi.getSummary(period), [period.year, period.month]);
}
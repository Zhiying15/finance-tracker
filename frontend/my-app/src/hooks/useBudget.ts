import { budgetApi } from "@api/index";
import { useAsync } from "./useAsync";
import type { Api } from "@api/index";

type PeriodParams = Api.Budget.QueryParams;

export function useBudgetSummary(period: PeriodParams) {
  return useAsync(() => budgetApi.getSummary(period), [period.year, period.month]);
}

export function useBudgetHistory() {
  return useAsync(() => budgetApi.getHistory(), []);
}
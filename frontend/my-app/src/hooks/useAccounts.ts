import { accountsApi } from "@api/index";
import { useAsync } from "./useAsync";

export function useAccounts(includeInactive = false) {
  return useAsync(() => accountsApi.list(includeInactive), [includeInactive]);
}

export function useAccountTypes() {
  return useAsync(() => accountsApi.getTypes(), []);
}

export function useNetWorth() {
  return useAsync(() => accountsApi.getNetWorth(), []);
}
import { client } from "@api/client";
import { ENDPOINTS } from "@api/endpoints";
import type { Api } from "@type/index";

export const accountsApi = {
  getTypes: async (): Promise<Api.Accounts.AccountType[]> => {
    const res = await client.get<Api.Accounts.AccountType[]>(ENDPOINTS.ACCOUNTS.TYPES);
    return res.data;
  },

  list: async (includeInactive = false): Promise<Api.Accounts.Account[]> => {
    const res = await client.get<Api.Accounts.Account[]>(ENDPOINTS.ACCOUNTS.LIST, {
      params: includeInactive ? { includeInactive: true } : undefined,
    });
    return res.data;
  },

  getNetWorth: async (): Promise<Api.Accounts.NetWorthResponse> => {
    const res = await client.get<Api.Accounts.NetWorthResponse>(ENDPOINTS.ACCOUNTS.NET_WORTH);
    return res.data;
  },

  getById: async (accountId: number): Promise<Api.Accounts.Account> => {
    const res = await client.get<Api.Accounts.Account>(ENDPOINTS.ACCOUNTS.BY_ID(accountId));
    return res.data;
  },

  create: async (body: Api.Accounts.CreateRequest): Promise<Api.Accounts.Account> => {
    const res = await client.post<Api.Accounts.Account>(ENDPOINTS.ACCOUNTS.LIST, body);
    return res.data;
  },

  update: async (accountId: number, body: Api.Accounts.UpdateRequest): Promise<Api.Accounts.Account> => {
    const res = await client.patch<Api.Accounts.Account>(ENDPOINTS.ACCOUNTS.BY_ID(accountId), body);
    return res.data;
  },

  updateValuation: async (
    accountId: number,
    body: Api.Accounts.UpdateValuationRequest,
  ): Promise<Api.Accounts.Account> => {
    const res = await client.patch<Api.Accounts.Account>(
      ENDPOINTS.ACCOUNTS.BY_ID(accountId),
      body,
    );
    return res.data;
  },

  deactivate: async (accountId: number): Promise<Api.Accounts.DeactivateResponse> => {
    await client.delete(ENDPOINTS.ACCOUNTS.BY_ID(accountId));
  },

  reactivate: async (accountId: number): Promise<Api.Accounts.ReactivateResponse> => {
    const res = await client.patch<Api.Accounts.Account>(
      ENDPOINTS.ACCOUNTS.REACTIVATE(accountId),
    );
    return res.data;
  },
};
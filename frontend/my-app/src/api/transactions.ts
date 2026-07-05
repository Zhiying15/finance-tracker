import { client } from "@api/client";
import { ENDPOINTS } from "@api/endpoints";
import type { Api } from "@type/index";

export const transactionsApi = {
  list: async (): Promise<Api.Transactions.Transaction[]> => {
    const res = await client.get<Api.Transactions.Transaction[]>(ENDPOINTS.TRANSACTIONS.LIST);
    return res.data;
  },

  listByPeriod: async (params: Api.Transactions.PeriodParams): Promise<Api.Transactions.Transaction[]> => {
    const res = await client.get<Api.Transactions.Transaction[]>(
      ENDPOINTS.TRANSACTIONS.BY_PERIOD,
      { params },
    );
    return res.data;
  },

  listByAccount: async (accountId: number): Promise<Api.Transactions.Transaction[]> => {
    const res = await client.get<Api.Transactions.Transaction[]>(
      ENDPOINTS.TRANSACTIONS.BY_ACCOUNT(accountId),
    );
    return res.data;
  },

  getSummary: async (params: Api.Transactions.PeriodParams): Promise<Api.Transactions.MonthlySummaryResponse> => {
    const res = await client.get<Api.Transactions.MonthlySummaryResponse>(
      ENDPOINTS.TRANSACTIONS.SUMMARY,
      { params },
    );
    return res.data;
  },

  getById: async (transactionId: number): Promise<Api.Transactions.Transaction> => {
    const res = await client.get<Api.Transactions.Transaction>(
      ENDPOINTS.TRANSACTIONS.BY_ID(transactionId),
    );
    return res.data;
  },

  create: async (body: Api.Transactions.CreateRequest): Promise<Api.Transactions.Transaction> => {
    const res = await client.post<Api.Transactions.Transaction>(
      ENDPOINTS.TRANSACTIONS.CREATE,
      body,
    );
    return res.data;
  },

  update: async (
    transactionId: number,
    body: Api.Transactions.UpdateRequest,
  ): Promise<Api.Transactions.Transaction> => {
    const res = await client.patch<Api.Transactions.Transaction>(
      ENDPOINTS.TRANSACTIONS.BY_ID(transactionId),
      body,
    );
    return res.data;
  },

  remove: async (transactionId: number): Promise<Api.Transactions.DeleteResponse> => {
    await client.delete(ENDPOINTS.TRANSACTIONS.BY_ID(transactionId));
  },
};
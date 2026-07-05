import { client } from "@api/client";
import { ENDPOINTS } from "@api/endpoints";
import type { Api } from "@type/index";

export const budgetApi = {
  getSummary: async (params: Api.Budget.QueryParams): Promise<Api.Budget.SummaryResponse> => {
    const res = await client.get<Api.Budget.SummaryResponse>(ENDPOINTS.BUDGET.SUMMARY, { params });
    return res.data;
  },

  getHistory: async (): Promise<Api.Budget.HistoryResponse> => {
    const res = await client.get<Api.Budget.Config[]>(ENDPOINTS.BUDGET.HISTORY);
    return res.data;
  },

  upsert: async (body: Api.Budget.UpsertRequest): Promise<Api.Budget.SummaryResponse> => {
    const res = await client.put<Api.Budget.SummaryResponse>(ENDPOINTS.BUDGET.UPSERT, body);
    return res.data;
  },

  remove: async (params: Api.Budget.QueryParams): Promise<Api.Budget.DeleteResponse> => {
    await client.delete(ENDPOINTS.BUDGET.DELETE, { params });
  },
};
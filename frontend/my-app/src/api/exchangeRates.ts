import { client } from "@api/client";
import { ENDPOINTS } from "@api/endpoints";
import type { Api } from "@type/index";

export const exchangeRatesApi = {
  getAll: async (): Promise<Api.ExchangeRates.Rate[]> => {
    const res = await client.get<Api.ExchangeRates.Rate[]>(ENDPOINTS.EXCHANGE_RATES.ALL);
    return res.data;
  },

  getRate: async (currencyCode: string): Promise<Api.ExchangeRates.Rate> => {
    const res = await client.get<Api.ExchangeRates.Rate>(
      ENDPOINTS.EXCHANGE_RATES.BY_CODE(currencyCode),
    );
    return res.data;
  },

  refresh: async (): Promise<Api.ExchangeRates.RefreshResponse> => {
    await client.post(ENDPOINTS.EXCHANGE_RATES.REFRESH);
  },
};
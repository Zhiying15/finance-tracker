import { client } from "@api/client";
import { ENDPOINTS } from "@api/endpoints";
import type { Api } from "@type/index";

export const dataDictionaryApi = {
  getAll: async (): Promise<Api.DataDictionary.Group[]> => {
    const res = await client.get<Api.DataDictionary.Group[]>(ENDPOINTS.DATA_DICTIONARY.ALL);
    return res.data;
  },

  getGroup: async (groupCode: Api.DataDictionary.GroupCode): Promise<Api.DataDictionary.Group> => {
    const res = await client.get<Api.DataDictionary.Group>(
      ENDPOINTS.DATA_DICTIONARY.GROUP(groupCode),
    );
    return res.data;
  },
};

export const DD_GROUPS = {
  BUDGET_TYPE:          "BUDGET_TYPE",
  TRANSACTION_FLOW:     "TRANSACTION_FLOW",
  ASSET_CLASS:          "ASSET_CLASS",
  ACCOUNT_CATEGORY:     "ACCOUNT_CATEGORY",
  IMPORT_REVIEW_STATUS: "IMPORT_REVIEW_STATUS",
  IMPORTED_FILE_STATUS: "IMPORTED_FILE_STATUS",
} as const satisfies Record<Api.DataDictionary.GroupCode, Api.DataDictionary.GroupCode>;
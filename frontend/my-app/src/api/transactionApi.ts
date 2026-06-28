import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";

export function getTransactions(params){

    return api.get(
        ENDPOINTS.transactions.root,
        {
            params
        }
    );
}
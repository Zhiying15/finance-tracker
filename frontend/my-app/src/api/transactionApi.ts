import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";

export function getTransactions(params: any){

    return api.get(
        ENDPOINTS.transactions.root,
        {
            params
        }
    );
}
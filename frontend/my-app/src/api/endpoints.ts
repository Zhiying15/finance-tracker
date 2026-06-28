export const ENDPOINTS = {

    auth: {

        login: "/auth/login",

        register: "/auth/register",

        me: "/auth/me"
    },

    accounts: {

        root: "/accounts",

        balance: (id:string)=>`/accounts/${id}/balance-history`
    },

    transactions: {

        root: "/transactions",

        byId:(id:string)=>`/transactions/${id}`
    },

    dashboard:{

        summary:"/dashboard",

        cashflow:"/dashboard/cashflow",

        assets:"/dashboard/assets"

    }

};
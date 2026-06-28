import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080/finance-tracker/api/v1",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json"
    }
});
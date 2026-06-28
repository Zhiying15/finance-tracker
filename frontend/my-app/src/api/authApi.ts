import { api } from "./axios";
import { ENDPOINTS } from "./endpoints";

export function login(request: LoginRequest){

    return api.post(
        ENDPOINTS.auth.login,
        request
    );
}

export function register(request:RegisterRequest){

    return api.post(
        ENDPOINTS.auth.register,
        request
    );
}
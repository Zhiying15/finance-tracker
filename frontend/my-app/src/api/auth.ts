import { client } from "@api/client";
import { ENDPOINTS } from "@api/endpoints";
import type { Api } from "@type/index";

export const authApi = {
  register: async (body: Api.Auth.RegisterRequest): Promise<Api.Auth.UserResponse> => {
    const res = await client.post<Api.Auth.UserResponse>(ENDPOINTS.AUTH.REGISTER, body);
    return res.data;
  },

  login: async (body: Api.Auth.LoginRequest): Promise<Api.Auth.UserResponse> => {
    const res = await client.post<Api.Auth.UserResponse>(ENDPOINTS.AUTH.LOGIN, body);
    return res.data;
  },

  me: async (): Promise<Api.Auth.UserResponse> => {
    const res = await client.get<Api.Auth.UserResponse>(ENDPOINTS.AUTH.ME);
    return res.data;
  },

  logout: async (): Promise<Api.Auth.LogoutResponse> => {
    await client.post(ENDPOINTS.AUTH.LOGOUT);
  },
};
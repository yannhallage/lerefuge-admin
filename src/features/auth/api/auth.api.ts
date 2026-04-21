import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import type {
  LoginInput,
  LoginResponse,
  RefreshResponse,
  RegisterInput,
  RegisterResponse,
} from "@/features/auth/api/auth.types"

export const authApi = {
  login: (payload: LoginInput) =>
    apiClient<LoginResponse>(API_ENDPOINTS.auth.login, {
      method: "POST",
      withAuth: false,
      body: JSON.stringify(payload),
    }),
  register: (payload: RegisterInput) =>
    apiClient<RegisterResponse>(API_ENDPOINTS.auth.register, {
      method: "POST",
      withAuth: false,
      body: JSON.stringify(payload),
    }),
  refresh: (refreshToken: string) =>
    apiClient<RefreshResponse>(API_ENDPOINTS.auth.refresh, {
      method: "POST",
      withAuth: false,
      body: JSON.stringify({ refreshToken }),
    }),
}

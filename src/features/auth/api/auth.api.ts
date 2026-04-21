import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import type { LoginInput, LoginResponse } from "@/features/auth/api/auth.types"

export const authApi = {
  login: (payload: LoginInput) =>
    apiClient<LoginResponse>(API_ENDPOINTS.auth.login, {
      method: "POST",
      withAuth: false,
      body: JSON.stringify(payload),
    }),
}

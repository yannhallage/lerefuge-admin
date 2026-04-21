import { useMutation } from "@tanstack/react-query"
import { authApi } from "@/features/auth/api/auth.api"
import type { LoginResponse } from "@/features/auth/api/auth.types"
import { setAccessToken, setRefreshToken } from "@/shared/utils/storage"

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response: LoginResponse) => {
      if (!response.success || !response.data) {
        throw new Error(response.message || "Connexion impossible.")
      }

      setAccessToken(response.data.accessToken)
      setRefreshToken(response.data.refreshToken)
    },
  })
}

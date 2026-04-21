import { useMutation } from "@tanstack/react-query"
import { authApi } from "@/features/auth/api/auth.api"
import { setAccessToken, setRefreshToken } from "@/shared/utils/storage"

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken)
      }
    },
  })
}

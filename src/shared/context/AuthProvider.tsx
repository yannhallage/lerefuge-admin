import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { AuthContext } from "@/shared/context/auth-context"
import { authApi } from "@/features/auth/api/auth.api"
import type { LoginInput } from "@/features/auth/api/auth.types"
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/shared/utils/storage"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAccessToken()))

  const login = useCallback(async (credentials: LoginInput) => {
    const response = await authApi.login(credentials)
    if (!response.success || !response.data) {
      throw new Error(response.message || "Connexion impossible.")
    }

    setAccessToken(response.data.accessToken)
    setRefreshToken(response.data.refreshToken)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    clearAuthTokens()
    setIsAuthenticated(false)
  }, [])

  const tryRefresh = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return

    try {
      const response = await authApi.refresh(refreshToken)
      if (!response.success || !response.data) {
        logout()
        return
      }
      setAccessToken(response.data.accessToken)
      setRefreshToken(response.data.refreshToken)
      setIsAuthenticated(true)
    } catch {
      logout()
    }
  }, [logout])

  useEffect(() => {
    if (!getAccessToken() && getRefreshToken()) {
      void tryRefresh()
    }
  }, [tryRefresh])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

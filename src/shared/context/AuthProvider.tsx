import { useCallback, useMemo, useState, type ReactNode } from "react"
import { AuthContext } from "@/shared/context/auth-context"

const STORAGE_KEY = "lerefuge-admin-auth"

function readStored(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStored)

  const login = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, "1")
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import { createContext } from "react"

import type { LoginInput } from "@/features/auth/api/auth.types"

export type AuthContextValue = {
  isAuthenticated: boolean
  login: (credentials: LoginInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

import type { ReactNode } from "react"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/shared/context/AuthProvider"

type AppProvidersProps = {
  children: ReactNode
}

/**
 * Point unique pour les providers globaux (thème, i18n, React Query, etc.).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )
}

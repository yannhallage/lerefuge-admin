import type { ReactNode } from "react"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/shared/context/AuthProvider"
import { ToastProvider } from "@/app/components/ToastProvider"

type AppProvidersProps = {
  children: ReactNode
}

const queryClient = new QueryClient()

/**
 * Point unique pour les providers globaux (thème, i18n, React Query, etc.).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

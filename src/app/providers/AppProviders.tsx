import type { ReactNode } from "react"

type AppProvidersProps = {
  children: ReactNode
}

/**
 * Point unique pour les providers globaux (thème, i18n, React Query, etc.).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return children
}

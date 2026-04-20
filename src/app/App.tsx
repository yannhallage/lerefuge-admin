import { AppRoutes } from "@/app/AppRoutes"
import { RouteChangeLoader } from "@/app/components/RouteChangeLoader"
import { AppProviders } from "@/app/providers/AppProviders"

export default function App() {
  return (
    <AppProviders>
      <RouteChangeLoader />
      <AppRoutes />
    </AppProviders>
  )
}

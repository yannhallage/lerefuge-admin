import { AppProviders } from "@/app/providers/AppProviders"
import { LoginPage } from "@/pages/auth/LoginPage"
import "@/app/styles/app.css"

export default function App() {
  return (
    <AppProviders>
      <LoginPage />
    </AppProviders>
  )
}

import type { ReactNode } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { LoginPage } from "@/pages/auth/LoginPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { AccueilPage } from "@/pages/accueil/AccueilPage"
import { LogementsPage } from "@/pages/logements/LogementsPage"
import { renderContentModule } from "@/pages/content-module/contentModules"
import { useAuth } from "@/shared/context/useAuth"
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout"

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />
  }
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/connexion" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="accueil" element={<AccueilPage />} />
        <Route path="a-propos" element={renderContentModule("about")} />
        <Route path="logements" element={<LogementsPage />} />
        <Route path="reservations" element={renderContentModule("booking")} />
        <Route path="offres" element={renderContentModule("offers")} />
        <Route path="activites" element={renderContentModule("activities")} />
        <Route path="carte" element={renderContentModule("menu")} />
        <Route path="blog" element={renderContentModule("blog")} />
        <Route path="galerie" element={renderContentModule("gallery")} />
        <Route path="contact" element={renderContentModule("contact")} />
        <Route path="seo" element={renderContentModule("seo")} />
        <Route path="parametres" element={renderContentModule("settings")} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

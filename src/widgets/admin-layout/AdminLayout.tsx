import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/shared/context/useAuth"
import styles from "./AdminLayout.module.css"

const LOGO_SRC = "/logo-refuge-du-bandama.png"

const NAV_GROUPS: {
  label: string
  items: { to: string; label: string; end?: boolean }[]
}[] = [
  {
    label: "Vue d'ensemble",
    items: [{ to: "/", label: "Tableau de bord", end: true }],
  },
  {
    label: "Pages vitrine",
    items: [
      { to: "/accueil", label: "Accueil" },
      { to: "/a-propos", label: "À propos" },
      { to: "/logements", label: "Logements" },
      { to: "/reservations", label: "Réservations" },
      { to: "/offres", label: "Offres" },
      { to: "/activites", label: "Activités" },
      { to: "/carte", label: "Carte restaurant" },
      { to: "/blog", label: "Blog / actualités" },
      { to: "/galerie", label: "Galerie" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    label: "Référencement & site",
    items: [
      { to: "/seo", label: "SEO" },
      { to: "/parametres", label: "Paramètres globaux" },
    ],
  },
]

function titleFromPath(pathname: string): string {
  for (const g of NAV_GROUPS) {
    const hit = g.items.find((i) =>
      i.end ? pathname === i.to : pathname === i.to || pathname.startsWith(`${i.to}/`),
    )
    if (hit) return hit.label
  }
  return "Administration"
}

export function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pageTitle = titleFromPath(location.pathname)

  function handleLogout() {
    logout()
    navigate("/connexion", { replace: true })
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Navigation principale">
        <div className={styles.brand}>
          <img
            className={styles.brandLogo}
            src={LOGO_SRC}
            alt=""
            width={44}
            height={44}
            decoding="async"
          />
          <div className={styles.brandText}>
            <p className={styles.brandTitle}>Le Refuge du Bandama</p>
            <p className={styles.brandSubtitle}>Espace administration</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className={styles.navSection}>{group.label}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.navLinkActive : ""].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <p className={styles.headerHint}>
              Contenu du site vitrine — sans modifier le HTML à la main.
            </p>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

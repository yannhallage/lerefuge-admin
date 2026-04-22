import { useCallback, useEffect, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import {
  BedDouble,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  HelpCircle,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Mountain,
  Newspaper,
  Settings,
  UtensilsCrossed,
} from "lucide-react"
import { useAuth } from "@/shared/context/useAuth"
import styles from "./AdminLayout.module.css"

const LOGO_SRC = "/logo-refuge-du-bandama.png"

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Vue d'ensemble",
    items: [{ to: "/", label: "Tableau de bord", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Pages vitrine",
    items: [
      { to: "/accueil", label: "Accueil", icon: Home },
      // { to: "/a-propos", label: "À propos", icon: Info },
      { to: "/logements", label: "Logements", icon: BedDouble },
      { to: "/reservations", label: "Réservations", icon: CalendarCheck2 },
      { to: "/carte", label: "Restaurations", icon: UtensilsCrossed },
      { to: "/activites", label: "Activités", icon: Mountain },
      { to: "/blog", label: "Blog / actualités", icon: Newspaper },
      { to: "/galerie", label: "Galerie", icon: Images },
      // { to: "/contact", label: "Contact", icon: Mail },
    ],
  },
  // {
  //   label: "Référencement & site",
  //   items: [
  //     { to: "/seo", label: "SEO", icon: Search },
  //     { to: "/parametres", label: "Paramètres globaux", icon: Settings },
  //   ],
  // },
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
  const isDashboardHome = location.pathname === "/"
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), [])

  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname, closeMobileMenu])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileMenuOpen])

  function handleLogout() {
    logout()
    navigate("/connexion", { replace: true })
  }

  return (
    <div
      className={[
        styles.shell,
        sidebarExpanded ? styles.shellExpanded : "",
        mobileMenuOpen ? styles.shellMobileNavOpen : "",
      ].join(" ")}
    >
      <header className={styles.mobileTopBar} aria-label="Barre d’outils mobile">
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-expanded={mobileMenuOpen}
          aria-controls="admin-sidebar"
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <Menu size={22} strokeWidth={1.75} aria-hidden />
        </button>
        <div className={styles.mobileTopBarRight}>
          <button
            type="button"
            className={styles.mobileIconBtn}
            title="Aide"
            aria-label="Aide (bientôt disponible)"
            disabled
          >
            <HelpCircle size={20} strokeWidth={1.75} aria-hidden />
          </button>
          <NavLink
            to="/parametres"
            className={({ isActive }) =>
              [styles.mobileIconBtn, styles.mobileIconBtnLink, isActive ? styles.mobileIconBtnActive : ""].join(
                " ",
              )
            }
            title="Paramètres"
            onClick={closeMobileMenu}
          >
            <Settings size={20} strokeWidth={1.75} aria-hidden />
          </NavLink>
          <button
            type="button"
            className={styles.mobileIconBtn}
            title="Applications"
            aria-label="Applications (bientôt disponible)"
            disabled
          >
            <Grid3x3 size={20} strokeWidth={1.75} aria-hidden />
          </button>
          <div className={styles.mobileUserAvatar} title="Session administrateur" aria-hidden>
            R
          </div>
        </div>
      </header>

      <button
        type="button"
        className={styles.mobileBackdrop}
        tabIndex={mobileMenuOpen ? 0 : -1}
        aria-label="Fermer le menu"
        aria-hidden={!mobileMenuOpen}
        onClick={closeMobileMenu}
      />

      <aside
        id="admin-sidebar"
        className={[styles.sidebar, sidebarExpanded ? styles.sidebarExpanded : ""].join(" ")}
        aria-label="Navigation principale"
      >
        <div className={styles.brand}>
          <img
            className={styles.brandLogo}
            src={LOGO_SRC}
            alt=""
            width={38}
            height={38}
            decoding="async"
          />
          {sidebarExpanded ? (
            <div className={styles.brandText}>
              <p className={styles.brandTitle}>Le Refuge du Bandama</p>
              <p className={styles.brandSubtitle}>Espace administration</p>
            </div>
          ) : null}
        </div>

        <nav className={styles.nav} aria-label="Sections">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              {sidebarExpanded ? (
                <p className={styles.navSection}>{group.label}</p>
              ) : (
                <div className={styles.navGroupRule} role="presentation" />
              )}
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        styles.navItem,
                        sidebarExpanded ? styles.navItemRow : styles.navItemStack,
                        isActive ? styles.navItemActive : "",
                      ].join(" ")
                    }
                    title={item.label}
                    onClick={closeMobileMenu}
                  >
                    <span className={styles.navIconWrap}>
                      <Icon className={styles.navIcon} size={20} strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className={styles.navLabel}>{item.label}</span>
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarBottomTools}>
            <button
              type="button"
              className={styles.iconButton}
              title="Aide"
              aria-label="Aide (bientôt disponible)"
              disabled
            >
              <HelpCircle size={20} strokeWidth={1.75} aria-hidden />
              {sidebarExpanded ? <span className={styles.iconButtonLabel}>Aide</span> : null}
            </button>
            <NavLink
              to="/parametres"
              className={({ isActive }) =>
                [styles.iconButton, styles.iconButtonLink, isActive ? styles.iconButtonActive : ""].join(
                  " ",
                )
              }
              title="Paramètres"
              onClick={closeMobileMenu}
            >
              <Settings size={20} strokeWidth={1.75} aria-hidden />
              {sidebarExpanded ? <span className={styles.iconButtonLabel}>Réglages</span> : null}
            </NavLink>
            <button
              type="button"
              className={styles.iconButton}
              onClick={handleLogout}
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              <LogOut size={20} strokeWidth={1.75} aria-hidden />
              {sidebarExpanded ? <span className={styles.iconButtonLabel}>Déconnexion</span> : null}
            </button>
          </div>
          <div className={styles.userAvatar} title="Session administrateur" aria-hidden>
            R
          </div>
        </div>

        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={() => setSidebarExpanded((v) => !v)}
          aria-expanded={sidebarExpanded}
          aria-label={sidebarExpanded ? "Réduire le menu" : "Développer le menu"}
        >
          {sidebarExpanded ? (
            <ChevronLeft size={18} strokeWidth={2} aria-hidden />
          ) : (
            <ChevronRight size={18} strokeWidth={2} aria-hidden />
          )}
        </button>
      </aside>

      <div className={styles.main}>
        {!isDashboardHome ? (
          <header className={styles.header}>
            <div>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
              <p className={styles.headerHint}>
                Contenu du site vitrine — sans modifier le HTML à la main.
              </p>
            </div>
          </header>
        ) : null}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

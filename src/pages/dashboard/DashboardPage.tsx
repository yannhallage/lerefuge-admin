import { useState } from "react"
import { Link } from "react-router-dom"
import {
  BedDouble,
  ChevronDown,
  Copy,
  HardDrive,
  Image as ImageIcon,
  Info,
  Sparkles,
  Star,
  Tag,
} from "lucide-react"
import styles from "./DashboardPage.module.css"

const SITE_ID = "lerefuge-bandama"

const USAGE_FILTERS = ["7 derniers jours", "30 derniers jours", "3 derniers mois", "12 derniers mois"] as const

const METRICS = [
  {
    label: "Articles blog",
    value: "—",
    hint: "Brouillon + publiés",
    Icon: ImageIcon,
  },
  {
    label: "Offres actives",
    value: "—",
    hint: "Période en cours",
    Icon: Tag,
  },
  {
    label: "Chambres listées",
    value: "—",
    hint: "Fiches logements",
    Icon: BedDouble,
  },
  {
    label: "Médias galerie",
    value: "—",
    hint: "Visibles sur le site",
    Icon: HardDrive,
  },
] as const

export function DashboardPage() {
  const [usageFilter, setUsageFilter] = useState<(typeof USAGE_FILTERS)[number]>("30 derniers jours")

  async function copySiteId() {
    try {
      await navigator.clipboard.writeText(SITE_ID)
    } catch {
      /* presse-papiers indisponible : ignoré */
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.greeting}>
          Bonjour <span className={styles.wave}>👋</span>
        </h1>
        <p className={styles.subtitle}>
          Utilisez ce tableau de bord pour suivre le contenu et gérer le site vitrine du Refuge du Bandama.
        </p>
      </header>

      {/* <details className={styles.section} open>
        <summary className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Site &amp; environnement</span>
          <ChevronDown className={styles.sectionChevron} size={18} strokeWidth={2} aria-hidden />
        </summary>
        <div className={styles.card}>
          <div className={styles.cardRow}>
            <div className={styles.cardMain}>
              <div className={styles.kv}>
                <span className={styles.k}>Identifiant espace</span>
                <span className={styles.v}>
                  <code className={styles.code}>{SITE_ID}</code>
                  <button
                    type="button"
                    className={styles.iconGhost}
                    onClick={() => void copySiteId()}
                    title="Copier"
                    aria-label="Copier l’identifiant espace"
                  >
                    <Copy size={16} strokeWidth={2} aria-hidden />
                  </button>
                </span>
              </div>
              <div className={styles.kv}>
                <span className={styles.k}>Mode contenu</span>
                <span className={styles.v}>
                  Édition dynamique (CMS)
                  <span className={styles.infoWrap} title="Les pages sont alimentées par les modules ci-contre.">
                    <Info size={16} strokeWidth={2} className={styles.infoIcon} aria-hidden />
                  </span>
                </span>
              </div>
            </div>
            <Link className={styles.primaryBtn} to="/parametres">
              Ouvrir les paramètres
            </Link>
          </div>
        </div>
      </details>

      <details className={styles.section} open>
        <summary className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Synthèse</span>
          <ChevronDown className={styles.sectionChevron} size={18} strokeWidth={2} aria-hidden />
        </summary>
        <div className={styles.twoCol}>
          <article className={styles.card}>
            <p className={styles.cardEyebrow}>Contenu suivi</p>
            <p className={styles.cardStat}>
              <span className={styles.statNum}>—</span>
              <span className={styles.statSlash}>/</span>
              <span className={styles.statTotal}>—</span>
            </p>
            <p className={styles.cardPercent}>Les chiffres seront reliés à votre API ou CMS.</p>
            <button type="button" className={styles.secondaryBtn} disabled>
              Détails
            </button>
          </article>
          <article className={`${styles.card} ${styles.planCard}`}>
            <Star className={styles.planStar} size={40} strokeWidth={1.25} aria-hidden />
            <p className={styles.planLabel}>Back-office</p>
            <p className={styles.planHint}>Gestion locale du contenu vitrine</p>
            <button type="button" className={styles.primaryBtnInline} disabled>
              Options avancées
            </button>
          </article>
        </div>
      </details>

      <details className={styles.section} open>
        <summary className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Vue d’ensemble</span>
          <ChevronDown className={styles.sectionChevron} size={18} strokeWidth={2} aria-hidden />
        </summary>
        <div className={styles.filterRow}>
          {USAGE_FILTERS.map((label) => (
            <button
              key={label}
              type="button"
              className={[styles.filter, usageFilter === label ? styles.filterActive : ""].join(" ")}
              onClick={() => setUsageFilter(label)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.card}>
          <div className={styles.metrics}>
            {METRICS.map(({ label, value, hint, Icon }) => (
              <div key={label} className={styles.metric}>
                <Icon className={styles.metricIcon} size={22} strokeWidth={1.75} aria-hidden />
                <p className={styles.metricLabel}>{label}</p>
                <p className={styles.metricValue}>{value}</p>
                <p className={styles.metricHint}>{hint}</p>
              </div>
            ))}
          </div>
        </div>
        <p className={styles.footerLink}>
          <Link to="/blog" className={styles.link}>
            Aller aux modules de contenu
          </Link>
        </p>
      </details> */}

      {/* <p className={styles.note}>
        <Sparkles size={16} strokeWidth={2} className={styles.noteIcon} aria-hidden />
        Prochaine étape : brancher chaque indicateur sur l’API du site vitrine pour des totaux en temps réel.
      </p> */}
    </div>
  )
}

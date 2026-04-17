import styles from "./DashboardPage.module.css"

const STATS = [
  { label: "Articles blog", value: "—", hint: "Brouillon + publiés" },
  { label: "Offres actives", value: "—", hint: "Période en cours" },
  { label: "Chambres", value: "—", hint: "Fiches logements" },
  { label: "Photos galerie", value: "—", hint: "Visibles sur le site" },
] as const

export function DashboardPage() {
  return (
    <div>
      <p className={styles.intro}>
        Indicateurs de base pour suivre le contenu publié. Les chiffres réels
        seront branchés sur votre API ou votre CMS headless une fois en place.
      </p>
      <div className={styles.grid}>
        {STATS.map((s) => (
          <article key={s.label} className={styles.card}>
            <p className={styles.cardLabel}>{s.label}</p>
            <p className={styles.cardValue}>{s.value}</p>
            <p className={styles.cardHint}>{s.hint}</p>
          </article>
        ))}
      </div>
      <p className={styles.note}>
        Prochaine étape : définir le modèle de données (chambres, offres, plats,
        etc.) et connecter chaque module à l’API du site vitrine pour que les
        modifications ici se reflètent automatiquement sur les pages HTML.
      </p>
    </div>
  )
}

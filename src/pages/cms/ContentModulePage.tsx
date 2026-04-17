import styles from "./ContentModulePage.module.css"

export type ContentModulePageProps = {
  title: string
  description: string
  planned: string[]
}

export function ContentModulePage({
  title,
  description,
  planned,
}: ContentModulePageProps) {
  return (
    <section className={styles.panel} aria-labelledby="module-title">
      <h2 id="module-title" className={styles.lead}>
        {title}
      </h2>
      <p className={styles.text}>{description}</p>
      <p className={styles.listTitle}>Fonctions prévues</p>
      <ul className={styles.list}>
        {planned.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <span className={styles.tag}>Formulaires à brancher sur l’API</span>
    </section>
  )
}

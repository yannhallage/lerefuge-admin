import { Pencil, Trash2 } from "lucide-react"
import styles from "../ActivitesPage.module.css"

type ActiviteItem = {
  id: string
  titre: string
}

type ActivitesTableSectionProps = {
  activites: ActiviteItem[]
  onRemoveActivite: (id: string) => void
}

export function ActivitesTableSection({ activites, onRemoveActivite }: ActivitesTableSectionProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Nom</th>
          <th scope="col" className={styles.actionHeader}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {activites.length === 0 ? (
          <tr>
            <td colSpan={2} className={styles.emptyCell}>
              Aucune activité trouvée.
            </td>
          </tr>
        ) : (
          activites.map((activite) => (
            <tr key={activite.id}>
              <td>{activite.titre}</td>
              <td className={styles.actionCell}>
                <div className={styles.actionButtons}>
                  <button type="button" className={styles.iconButton} aria-label={`Modifier ${activite.titre}`}>
                    <Pencil size={15} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                    onClick={() => onRemoveActivite(activite.id)}
                    aria-label={`Supprimer ${activite.titre}`}
                  >
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

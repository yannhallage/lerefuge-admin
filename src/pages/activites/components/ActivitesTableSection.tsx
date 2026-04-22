import { CalendarCheck2, Trash2 } from "lucide-react"
import styles from "../ActivitesPage.module.css"

type ActiviteItem = {
  id: string
  titre: string
}

type ActivitesTableSectionProps = {
  activites: ActiviteItem[]
  onRemoveActivite: (id: string) => void
  query: string
  onResetSearch: () => void
}

export function ActivitesTableSection({ activites, onRemoveActivite, query, onResetSearch }: ActivitesTableSectionProps) {
  const rechercheActive = query.trim().length > 0
  return (
    <section className={styles.listSection} aria-label="Liste des activités">
      {activites.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            <CalendarCheck2 size={36} strokeWidth={1.5} className={styles.emptyIcon} aria-hidden />
            <p className={styles.emptyTitle}>{rechercheActive ? "Aucun résultat" : "Aucune activité"}</p>
            <p className={styles.emptyText}>
              {rechercheActive
                ? "Modifiez ou effacez votre recherche pour voir plus de lignes."
                : "Ajoutez votre première activité pour commencer la gestion du catalogue."}
            </p>
            {rechercheActive ? (
              <button type="button" className={styles.emptyAction} onClick={onResetSearch}>
                Réinitialiser la recherche
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.listHeader} role="row">
            <div className={styles.listHeaderTitle}>Activité</div>
            <div className={styles.listHeaderActions}>Actions</div>
          </div>

          <div className={styles.listBody}>
            {activites.map((activite) => (
              <div key={activite.id} className={styles.listRow} role="row">
                <div className={styles.listTitle}>{activite.titre}</div>
                <div className={styles.actionCell}>
                  <div className={styles.actionButtons}>
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                      onClick={() => onRemoveActivite(activite.id)}
                      aria-label={`Supprimer ${activite.titre}`}
                    >
                      <Trash2 size={14} aria-hidden />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

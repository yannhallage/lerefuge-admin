import { Pencil, Trash2 } from "lucide-react"
import { useState, type PointerEvent } from "react"
import styles from "../ActivitesPage.module.css"

type ActiviteItem = {
  id: string
  titre: string
  sousInfo?: string
}

type ActivitesTableSectionProps = {
  activites: ActiviteItem[]
  onRemoveActivite: (id: string) => void
}

export function ActivitesTableSection({ activites, onRemoveActivite }: ActivitesTableSectionProps) {
  const [swipedRowId, setSwipedRowId] = useState<string | null>(null)
  const [pointerStartX, setPointerStartX] = useState<number | null>(null)

  function handlePointerDown(event: PointerEvent<HTMLLIElement>) {
    setPointerStartX(event.clientX)
  }

  function handlePointerUp(event: PointerEvent<HTMLLIElement>, id: string) {
    if (pointerStartX === null) return
    const deltaX = event.clientX - pointerStartX
    if (deltaX < -42) {
      setSwipedRowId(id)
    } else if (deltaX > 24) {
      setSwipedRowId(null)
    }
    setPointerStartX(null)
  }

  return (
    <section className={styles.listSection} aria-label="Liste des activités">
      {activites.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Aucune activité pour le moment</p>
          <p className={styles.emptySubtitle}>Ajoutez votre première activité avec le bouton +</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {activites.map((activite) => (
            <li
              key={activite.id}
              className={styles.row}
              onPointerDown={handlePointerDown}
              onPointerUp={(event) => handlePointerUp(event, activite.id)}
            >
              <div className={`${styles.rowContent} ${swipedRowId === activite.id ? styles.rowContentSwiped : ""}`}>
                <div className={styles.textBlock}>
                  <p className={styles.rowTitle}>{activite.titre}</p>
                  {activite.sousInfo ? <p className={styles.rowMeta}>{activite.sousInfo}</p> : null}
                </div>
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

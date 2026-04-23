import { Trash2 } from "lucide-react"
import { BeatLoader } from "react-spinners"
import styles from "./ActivitesImagesGallery.module.css"

type ActiviteItem = {
  id: string
  titre: string
  image: string
}

type ActivitesImagesGalleryProps = {
  activites: ActiviteItem[]
  onDeleteImage?: (activite: ActiviteItem) => void
  isDeleting?: boolean
  deletingActiviteId?: string | null
}

export function ActivitesImagesGallery({
  activites,
  onDeleteImage,
  isDeleting = false,
  deletingActiviteId = null,
}: ActivitesImagesGalleryProps) {
  if (activites.length === 0) {
    return <p className={styles.empty}>Aucune image à afficher pour cette recherche.</p>
  }

  return (
    <section className={styles.wrap} aria-label="Galerie des activités">
      <ul className={styles.grid}>
        {activites.map((activite) => (
          <li key={activite.id} className={styles.card}>
            <div className={styles.media}>
              <img
                className={styles.image}
                src={activite.image}
                alt={`Illustration de ${activite.titre}`}
                loading="lazy"
              />
              {onDeleteImage ? (
                <button
                  type="button"
                  className={styles.deleteButton}
                  aria-label={`Supprimer l'image de ${activite.titre}`}
                  onClick={() => onDeleteImage(activite)}
                  disabled={isDeleting}
                  title="Supprimer"
                >
                  {isDeleting && deletingActiviteId === activite.id ? (
                    <BeatLoader size={6} color="#fff" aria-hidden />
                  ) : (
                    <Trash2 size={14} aria-hidden />
                  )}
                </button>
              ) : null}
            </div>
            <p className={styles.title}>{activite.titre}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

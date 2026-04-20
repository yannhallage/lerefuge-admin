import styles from "./ActivitesImagesGallery.module.css"

type ActiviteItem = {
  id: string
  titre: string
}

type ActivitesImagesGalleryProps = {
  activites: ActiviteItem[]
}

function getImageUrl(index: number) {
  const images = [
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=80",
  ]

  return images[index % images.length]
}

export function ActivitesImagesGallery({ activites }: ActivitesImagesGalleryProps) {
  if (activites.length === 0) {
    return <p className={styles.empty}>Aucune image à afficher pour cette recherche.</p>
  }

  return (
    <section className={styles.wrap} aria-label="Galerie des activités">
      <ul className={styles.grid}>
        {activites.map((activite, index) => (
          <li key={activite.id} className={styles.card}>
            <img
              className={styles.image}
              src={getImageUrl(index)}
              alt={`Illustration de ${activite.titre}`}
              loading="lazy"
            />
            <p className={styles.title}>{activite.titre}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

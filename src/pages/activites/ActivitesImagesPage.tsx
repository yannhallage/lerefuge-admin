import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import styles from "./ActivitesPage.module.css"
import { ActivitesImagesGallery } from "./components/ActivitesImagesGallery.tsx"
import { useActivitesList } from "@/features/activites/hooks/useActivites"

export function ActivitesImagesPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const { data: activitesData = [] } = useActivitesList()

  const activites = useMemo(
    () =>
      activitesData.map((item) => ({
        id: item.activite_id,
        titre: item.nom,
        image: item.image,
      })),
    [activitesData],
  )

  const activitesFiltrees = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activites
    return activites.filter((activite) => activite.titre.toLowerCase().includes(q))
  }, [activites, query])

  function handleAjouterImage() {
    navigate("/activites")
  }

  return (
    <section className={styles.container}>
      <div className={styles.toolbar}>
        <label className={styles.search} aria-label="Rechercher une activité">
          <Search size={16} className={styles.searchIcon} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.searchInput}
            placeholder="Rechercher une activité..."
            autoComplete="off"
          />
        </label>

        <div className={styles.actions}>
          <button type="button" className={styles.viewButton} onClick={() => navigate("/activites")}>
            Tableau
          </button>
          <button type="button" className={`${styles.viewButton} ${styles.viewButtonActive}`}>
            Images
          </button>
          <button type="button" className={styles.addButton} onClick={handleAjouterImage}>
            + Ajouter une image
          </button>
        </div>
      </div>

      <ActivitesImagesGallery activites={activitesFiltrees} />

      <button
        type="button"
        className={styles.fabButton}
        onClick={handleAjouterImage}
        aria-label="Ajouter une image"
      >
        <Plus size={20} aria-hidden />
      </button>
    </section>
  )
}

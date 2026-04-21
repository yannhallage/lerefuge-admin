import { useEffect, useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import styles from "./ActivitesPage.module.css"
import { AddActiviteModal } from "./modal/AddActiviteModal"
import { ActivitesTableSection } from "./components/ActivitesTableSection"
import { loadActivites, saveActivites, type ActiviteRow } from "./activitesStorage"

export function ActivitesPage() {
  const navigate = useNavigate()
  const [activites, setActivites] = useState<ActiviteRow[]>(loadActivites)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    saveActivites(activites)
  }, [activites])

  function handleAjouterActivite(titre: string) {
    const valeur = titre.trim()
    if (!valeur) return
    setActivites((prev) => [{ id: `act-${Date.now()}`, titre: valeur }, ...prev])
    setIsModalOpen(false)
  }

  function handleSupprimerActivite(id: string) {
    setActivites((prev) => prev.filter((activite) => activite.id !== id))
  }

  const activitesFiltrees = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activites
    return activites.filter((activite) => activite.titre.toLowerCase().includes(q))
  }, [activites, query])

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
          <button
            type="button"
            className={`${styles.viewButton} ${styles.viewButtonActive}`}
          >
            Tableau
          </button>
          <button
            type="button"
            className={styles.viewButton}
            onClick={() => navigate("/activites/images")}
          >
            Images
          </button>
          <button type="button" className={styles.addButton} onClick={() => setIsModalOpen(true)}>
            <Plus size={15} aria-hidden />
            <span>Ajouter une activité</span>
          </button>
        </div>
      </div>

      <ActivitesTableSection activites={activitesFiltrees} onRemoveActivite={handleSupprimerActivite} />

      <AddActiviteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAjouterActivite} />
    </section>
  )
}

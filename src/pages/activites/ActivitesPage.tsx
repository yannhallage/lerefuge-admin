import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import styles from "./ActivitesPage.module.css"
import { AddActiviteModal } from "./modal/AddActiviteModal"
import { ActivitesTableSection } from "./components/ActivitesTableSection"
import { useActivitesList, useCreateActivite, useDeleteActivite } from "@/features/activites/hooks/useActivites"

export function ActivitesPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { data: activitesData = [] } = useActivitesList()
  const createActivite = useCreateActivite()
  const deleteActivite = useDeleteActivite()

  async function handleAjouterActivite(payload: { nom: string; image?: File }) {
    await createActivite.mutateAsync(payload)
    setIsModalOpen(false)
  }

  function handleSupprimerActivite(id: string) {
    void deleteActivite.mutateAsync(id)
  }

  const activites = useMemo(
    () => activitesData.map((item) => ({ id: item.activite_id, titre: item.nom })),
    [activitesData],
  )

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

      <button
        type="button"
        className={styles.fabButton}
        onClick={() => setIsModalOpen(true)}
        aria-label="Ajouter une activité"
      >
        <Plus size={20} aria-hidden />
      </button>

      <AddActiviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAjouterActivite}
        isSubmitting={createActivite.isPending}
      />
    </section>
  )
}

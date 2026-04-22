import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Plus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import styles from "./ActivitesPage.module.css"
import { AddActiviteModal } from "./modal/AddActiviteModal"
import { ActivitesTableSection } from "./components/ActivitesTableSection"
import { useActivitesList, useCreateActivite, useDeleteActivite } from "@/features/activites/hooks/useActivites"
import { useToast } from "@/app/components/ToastProvider"

export function ActivitesPage() {
  const baseId = useId()
  const searchId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const hasShownListErrorToastRef = useRef(false)
  const navigate = useNavigate()
  const toast = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [submitError, setSubmitError] = useState("")
  const { data: activitesData = [], isError: isActivitesListError } = useActivitesList()
  const createActivite = useCreateActivite()
  const deleteActivite = useDeleteActivite()

  useEffect(() => {
    if (!isActivitesListError) {
      hasShownListErrorToastRef.current = false
      return
    }
    if (hasShownListErrorToastRef.current) return
    hasShownListErrorToastRef.current = true
    toast.error({
      title: "Chargement impossible",
      description: "La liste des activites n'a pas pu etre recuperee. Reessayez dans un instant.",
    })
  }, [isActivitesListError, toast])

  async function handleAjouterActivite(payload: { nom: string; image?: File }) {
    try {
      setSubmitError("")
      await createActivite.mutateAsync(payload)
      setIsModalOpen(false)
    } catch {
      setSubmitError("Impossible d'ajouter l'activité pour le moment. Réessayez.")
      throw new Error("creation-failed")
    }
  }

  async function handleSupprimerActivite(id: string) {
    try {
      await deleteActivite.mutateAsync(id)
      toast.success({
        title: "Activite supprimee",
        description: "L'activite a ete supprimee avec succes.",
      })
    } catch {
      toast.error({
        title: "Suppression impossible",
        description: "Une erreur est survenue pendant la suppression de l'activite.",
      })
    }
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
  const totalListe = activites.length
  const totalFiltres = activitesFiltrees.length
  const rechercheActive = query.trim().length > 0

  return (
    <section className={styles.wrap}>
      <section className={styles.intro} aria-labelledby={`${baseId}-intro-title`}>
        <h2 id={`${baseId}-intro-title`} className={styles.introTitle}>
          Activités
        </h2>
        <p className={styles.introText}>
          Gestion du catalogue d'activités affiché sur le site. Ajoutez, recherchez et supprimez des activités depuis ce tableau.
        </p>
      </section>

      <div className={styles.breadcrumbRow}>
        <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
          <span className={styles.breadcrumbMuted}>Contenu</span>
          <span className={styles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <span>Activités</span>
        </nav>
        <button
          type="button"
          className={styles.quickSearchBtn}
          aria-label="Aller à la recherche"
          onClick={() => searchInputRef.current?.focus()}
        >
          <Search size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <div className={styles.toolbarTop}>
        <div className={styles.searchRow}>
          <div className={styles.searchBar}>
            <label className={styles.search} htmlFor={searchId}>
              <Search className={styles.searchIcon} size={17} strokeWidth={1.75} aria-hidden />
              <input
                ref={searchInputRef}
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={styles.queryInput}
                placeholder="Nom de l'activité…"
                autoComplete="off"
              />
            </label>
          </div>
        </div>

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
          <button
            type="button"
            className={styles.addButton}
            onClick={() => {
              setSubmitError("")
              setIsModalOpen(true)
            }}
          >
            <Plus size={15} aria-hidden />
            <span>Ajouter une activité</span>
          </button>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <p className={styles.summaryText}>
          <span className={styles.summaryLead}>
            <strong>{totalFiltres}</strong> {totalFiltres === 1 ? "ligne affichée" : "lignes affichées"}
          </span>
          <span className={styles.summarySub}>
            {" "}
            · total : <strong>{totalListe}</strong> {totalListe === 1 ? "activité" : "activités"}
            {rechercheActive ? (
              <>
                {" "}
                · filtre « <span className={styles.summaryQuery}>{query.trim()}</span> »
              </>
            ) : null}
          </span>
        </p>
      </div>

      <ActivitesTableSection
        activites={activitesFiltrees}
        onRemoveActivite={handleSupprimerActivite}
        query={query}
        onResetSearch={() => setQuery("")}
      />

      <button
        type="button"
        className={styles.fabButton}
        onClick={() => {
          setSubmitError("")
          setIsModalOpen(true)
        }}
        aria-label="Ajouter une activité"
      >
        <Plus size={20} aria-hidden />
      </button>

      <AddActiviteModal
        isOpen={isModalOpen}
        onClose={() => {
          setSubmitError("")
          setIsModalOpen(false)
        }}
        onSubmit={handleAjouterActivite}
        isSubmitting={createActivite.isPending}
        errorMessage={submitError}
      />
    </section>
  )
}

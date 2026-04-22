import { useId, useMemo, useRef, useState } from "react"
import { Plus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import styles from "./ActivitesPage.module.css"
import { ActivitesImagesGallery } from "./components/ActivitesImagesGallery"
import { UploadActiviteImageModal } from "./modal/UploadActiviteImageModal"
import { useActivitesList, useDeleteActivite, useUpdateActivite } from "@/features/activites/hooks/useActivites"
import { useToast } from "@/app/components/ToastProvider"

export function ActivitesImagesPage() {
  const baseId = useId()
  const searchId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const toast = useToast()
  const updateActivite = useUpdateActivite()
  const deleteActivite = useDeleteActivite()
  const [query, setQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const { data: activitesData = [], isLoading, isError } = useActivitesList()

  const activitesAvecImage = useMemo(
    () =>
      activitesData
        .filter((item) => typeof item.image === "string" && item.image.trim().length > 0)
        .map((item) => ({
          id: item.activite_id,
          titre: item.nom,
          image: item.image as string,
        })),
    [activitesData],
  )

  const activitesFiltrees = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activitesAvecImage
    return activitesAvecImage.filter((activite) => activite.titre.toLowerCase().includes(q))
  }, [activitesAvecImage, query])
  const totalListe = activitesAvecImage.length
  const totalFiltres = activitesFiltrees.length
  const rechercheActive = query.trim().length > 0
  const activitesOptions = useMemo(
    () =>
      activitesData.map((item) => ({
        id: item.activite_id,
        titre: item.nom,
      })),
    [activitesData],
  )

  async function handleAjouterImage(payload: { id: string; image: File }) {
    try {
      setSubmitError("")
      await updateActivite.mutateAsync({ id: payload.id, payload: { image: payload.image } })
      setIsModalOpen(false)
    } catch {
      setSubmitError("Impossible d'uploader l'image pour le moment. Reessayez.")
      throw new Error("upload-failed")
    }
  }

  async function handleSupprimerImage(activite: { id: string; titre: string }) {
    const confirmed = window.confirm(`Supprimer l'activite "${activite.titre}" ?`)
    if (!confirmed) return
    try {
      await deleteActivite.mutateAsync(activite.id)
      toast.success({
        title: "Image supprimee",
        description: `L'entree "${activite.titre}" a ete supprimee.`,
      })
    } catch {
      toast.error({
        title: "Suppression impossible",
        description: "Une erreur est survenue pendant la suppression.",
      })
    }
  }

  return (
    <section className={styles.wrap}>
      <section className={styles.intro} aria-labelledby={`${baseId}-intro-title`}>
        <h2 id={`${baseId}-intro-title`} className={styles.introTitle}>
          Activités
        </h2>
        <p className={styles.introText}>
          Consultation des visuels associés aux activités. Filtrez rapidement la galerie pour retrouver une activité et
          vérifier son image.
        </p>
      </section>

      <div className={styles.breadcrumbRow}>
        <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
          <span className={styles.breadcrumbMuted}>Contenu</span>
          <span className={styles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <span>Activités</span>
          <span className={styles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <span>Images</span>
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
          <button type="button" className={styles.viewButton} onClick={() => navigate("/activites")}>
            Tableau
          </button>
          <button type="button" className={`${styles.viewButton} ${styles.viewButtonActive}`}>
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
            + Ajouter une image
          </button>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <p className={styles.summaryText}>
          <span className={styles.summaryLead}>
            <strong>{totalFiltres}</strong> {totalFiltres === 1 ? "image affichée" : "images affichées"}
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

      {isLoading ? <p className={styles.summaryText}>Chargement des images...</p> : null}
      {isError ? <p className={styles.summaryText}>Impossible de charger les images depuis l'API.</p> : null}
      {!isLoading && !isError ? (
        <ActivitesImagesGallery
          activites={activitesFiltrees}
          onDeleteImage={handleSupprimerImage}
          isDeleting={deleteActivite.isPending}
        />
      ) : null}

      <button
        type="button"
        className={styles.fabButton}
        onClick={() => {
          setSubmitError("")
          setIsModalOpen(true)
        }}
        aria-label="Ajouter une image"
      >
        <Plus size={20} aria-hidden />
      </button>

      <UploadActiviteImageModal
        isOpen={isModalOpen}
        onClose={() => {
          setSubmitError("")
          setIsModalOpen(false)
        }}
        activites={activitesOptions}
        onSubmit={handleAjouterImage}
        isSubmitting={updateActivite.isPending}
        errorMessage={submitError}
      />
    </section>
  )
}

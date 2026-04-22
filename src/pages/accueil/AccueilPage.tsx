import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react"
import {
  Bookmark,
  Check,
  ChevronDown,
  Download,
  Grid3x3,
  LayoutList,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { BeatLoader } from "react-spinners"
import styles from "./AccueilPage.module.css"
import {
  useAccueilList,
  useCreateAccueil,
  useDeleteAccueil,
  useSetFeaturedAccueil,
} from "@/features/accueil/hooks/useAccueil"
import type { AccueilItem } from "@/features/accueil/api/accueil.types"
import { useToast } from "@/app/components/ToastProvider"

const STORAGE_KEY = "lerefuge-accueil-images-selection"
const MAX_SELECTION = 3

export type AccueilLibraryImage = {
  id: string
  src: string
  alt: string
  deleteId?: string
  /** Indique qu’une version de ce visuel est déjà publiée sur l’accueil client */
  dejaUtilisee?: boolean
}

function loadSelection(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return new Set()
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((x): x is string => typeof x === "string"))
  } catch {
    return new Set()
  }
}

function saveSelection(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

function getSelectionId(img: AccueilLibraryImage): string {
  return img.deleteId ?? img.id
}

const FILTRES_PRINCIPAUX = ["Dossiers", "Étiquettes", "Formats", "Date de création", "Types de médias"] as const

export function AccueilPage() {
  const searchId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { data, isLoading, isFetching, refetch, error } = useAccueilList()
  const createAccueil = useCreateAccueil()
  const deleteAccueil = useDeleteAccueil()
  const setFeaturedAccueil = useSetFeaturedAccueil()
  const toast = useToast()
  const [query, setQuery] = useState("")
  const [tri, setTri] = useState<"pertinence" | "recent">("pertinence")
  const [vueGrille, setVueGrille] = useState(true)
  const [selection, setSelection] = useState<Set<string>>(loadSelection)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadTotalCount, setUploadTotalCount] = useState(0)
  const [uploadingCount, setUploadingCount] = useState(0)

  const images = useMemo<AccueilLibraryImage[]>(() => {
    const list = data ?? []
    return list
      .filter((item: AccueilItem) => Boolean(item.image))
      .map((item: AccueilItem, index) => ({
        id: item.accueil_id ?? `${item.titre}-${index}`,
        src: item.image as string,
        alt: item.titre || "Image accueil",
        deleteId: item.accueil_id,
        dejaUtilisee: Boolean(item.isFeatured),
      }))
  }, [data])

  const validSelectionIds = useMemo(() => new Set(images.map((img) => getSelectionId(img))), [images])

  const filtrees = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = images
    if (q) {
      list = list.filter(
        (img) =>
          img.alt.toLowerCase().includes(q) ||
          img.id.toLowerCase().includes(q) ||
          img.src.toLowerCase().includes(q),
      )
    }
    const copy = [...list]
    if (tri === "recent") {
      copy.reverse()
    }
    return copy
  }, [images, query, tri])

  const toggleSelection = useCallback((id: string) => {
    setSelection((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size >= MAX_SELECTION) {
        // A 3 selections, remplacer la plus ancienne rend le comportement plus fluide.
        const [oldest] = next
        if (oldest) {
          next.delete(oldest)
        }
        next.add(id)
        toast.info({
          title: "Selection mise a jour",
          description: "Une image precedente a ete remplacee.",
        })
      } else next.add(id)
      return next
    })
  }, [toast])

  const enregistrerSelection = useCallback(async () => {
    if (selection.size !== MAX_SELECTION) {
      toast.warning({
        title: "Selection incomplete",
        description: `Selectionnez exactement ${MAX_SELECTION} images pour continuer.`,
      })
      return
    }

    const selectedAccueilIds = [...selection].filter((id) => validSelectionIds.has(id))

    if (selectedAccueilIds.length !== MAX_SELECTION) {
      toast.error({
        title: "Selection invalide",
        description: "Veuillez selectionner exactement 3 images valides.",
      })
      return
    }

    try {
      await setFeaturedAccueil.mutateAsync({ accueil_ids: selectedAccueilIds })
      setSelection(new Set())
      await refetch()
      toast.success({
        title: "Selection enregistree",
        description: "Les 3 visuels de l’accueil ont ete mis a jour.",
      })
    } catch {
      toast.error({
        title: "Enregistrement impossible",
        description: "Une erreur est survenue pendant l'enregistrement des visuels.",
      })
    }
  }, [refetch, selection, setFeaturedAccueil, toast, validSelectionIds])

  const handleFichiers = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const run = async () => {
      const files = e.target.files
      if (!files?.length) return
      const imagesToUpload = Array.from(files).filter((file) => file.type.startsWith("image/"))
      if (!imagesToUpload.length) {
        setUploadError("Aucune image valide a televerser.")
        e.target.value = ""
        return
      }
      setUploadError(null)
      setIsUploading(true)
      setUploadTotalCount(imagesToUpload.length)
      setUploadingCount(imagesToUpload.length)

      for (let i = 0; i < imagesToUpload.length; i++) {
        const file = imagesToUpload[i]
        const titre = file.name.replace(/\.[^.]+$/, "") || "Image importee"
        await createAccueil.mutateAsync({ titre, image: file })
        setUploadingCount((prev) => Math.max(0, prev - 1))
      }
      await refetch()
      e.target.value = ""
      setUploadingCount(0)
      setIsUploading(false)
      toast.success({
        title: "Televersement termine",
        description: `${imagesToUpload.length} fichier${imagesToUpload.length > 1 ? "s" : ""} traite${imagesToUpload.length > 1 ? "s" : ""}.`,
      })
    }

    run().catch(() => {
      setUploadError("Le televersement a echoue.")
      setUploadingCount(0)
      setIsUploading(false)
      e.target.value = ""
      toast.error({
        title: "Televersement impossible",
        description: "Une erreur est survenue pendant l'import des visuels.",
      })
    })
  }, [createAccueil, refetch, toast])

  const supprimerImage = useCallback((img: AccueilLibraryImage) => {
    if (!img.deleteId) {
      setUploadError("Impossible de supprimer cette image.")
      return
    }
    if (!window.confirm(`Supprimer « ${img.alt} » des visuels de l’accueil ?`)) return
    deleteAccueil
      .mutateAsync(img.deleteId)
      .then(() => {
        setSelection((prev) => {
          const selectionId = getSelectionId(img)
          if (!prev.has(selectionId)) return prev
          const next = new Set(prev)
          next.delete(selectionId)
          return next
        })
        return refetch()
      })
      .then(() => {
        toast.success({
          title: "Image supprimee",
          description: `Le visuel "${img.alt}" a ete retire.`,
        })
      })
      .catch(() => {
        setUploadError("La suppression a echoue.")
        toast.error({
          title: "Suppression impossible",
          description: `Le visuel "${img.alt}" n'a pas pu etre supprime.`,
        })
      })
  }, [deleteAccueil, refetch, toast])

  useEffect(() => {
    saveSelection(selection)
  }, [selection])

  useEffect(() => {
    setSelection((prev) => {
      const cleaned = new Set([...prev].filter((id) => validSelectionIds.has(id)))
      if (cleaned.size === prev.size) return prev
      return cleaned
    })
  }, [validSelectionIds])

  const nombreSelection = selection.size
  const isSelectionReady = nombreSelection === MAX_SELECTION
  const uploadedCount = uploadTotalCount - uploadingCount
  const uploadProgress =
    uploadTotalCount > 0 ? Math.min(100, Math.round((uploadedCount / uploadTotalCount) * 100)) : 0

  return (
    <div className={styles.wrap}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.fileInput}
        onChange={handleFichiers}
        disabled={createAccueil.isPending}
        aria-hidden
        tabIndex={-1}
      />
      <section className={styles.intro} aria-labelledby="accueil-intro-title">
        <h2 id="accueil-intro-title" className={styles.introTitle}>
          Visuels de l’accueil
        </h2>
        <p className={styles.introText}>
          Les fichiers cochés sont ceux prévus pour le bandeau d’accueil. Vous pouvez en ajouter
          depuis votre ordinateur.
        </p>
      </section>
      {error ? (
        <p className={styles.empty}>Impossible de charger les visuels de l’accueil.</p>
      ) : null}
      {uploadError ? <p className={styles.empty}>{uploadError}</p> : null}
      {isUploading ? (
        <div
          className={styles.uploadProgressWrap}
          role="status"
          aria-live="polite"
          style={{ "--upload-progress": `${uploadProgress}%` } as CSSProperties}
        >
          <p className={styles.uploadProgressText}>
            Televersement en cours... {uploadProgress}% ({uploadedCount}/{uploadTotalCount})
          </p>
          <div className={styles.uploadProgressBar} aria-hidden>
            <span className={styles.uploadProgressFill} style={{ width: `${uploadProgress}%` }} />
          </div>
          <div className={styles.uploadProgressMobileCircle} aria-hidden>
            <span className={styles.uploadProgressMobileValue}>{uploadProgress}%</span>
          </div>
        </div>
      ) : null}

      <div className={styles.breadcrumbRow}>
        <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
          <span className={styles.breadcrumbMuted}>Médiathèque</span>
          <span className={styles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <span>Ressources</span>
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
                className={styles.searchInput}
                placeholder="Saisir un nom, une étiquette ou une métadonnée…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </label>
          </div>
          <div className={styles.addWrap}>
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload size={17} strokeWidth={2} aria-hidden />
              {isUploading ? "Televersement..." : "Téléverser"}
            </button>
          </div>
        </div>

        <div className={styles.filtersPrimary} role="group" aria-label="Filtres">
          {FILTRES_PRINCIPAUX.map((label) => (
            <button key={label} type="button" className={styles.filterPill} disabled>
              {label}
              <ChevronDown className={styles.filterChevron} size={14} strokeWidth={2} aria-hidden />
            </button>
          ))}
        </div>

        <div className={styles.filtersSecondary} role="group" aria-label="Filtres complémentaires">
          <button type="button" className={styles.filterPill} disabled>
            Plus
            <ChevronDown className={styles.filterChevron} size={14} strokeWidth={2} aria-hidden />
          </button>
          <button type="button" className={styles.filterPillSaved} disabled>
            <Bookmark className={styles.filterBookmark} size={14} strokeWidth={2} aria-hidden />
            Enregistrés
          </button>
        </div>

        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.iconGhost}
            title="Actualiser"
            aria-label="Actualiser"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={18} strokeWidth={2} aria-hidden />
          </button>
          <div className={styles.actionsRight}>
            <label className={styles.sortLabel}>
              <span className={styles.srOnly}>Tri</span>
              <select
                className={styles.sortSelect}
                value={tri}
                onChange={(e) => setTri(e.target.value as "pertinence" | "recent")}
              >
                <option value="pertinence">Pertinence</option>
                <option value="recent">Plus récent</option>
              </select>
            </label>
            <button type="button" className={styles.iconGhost} title="Télécharger" aria-label="Télécharger">
              <Download size={18} strokeWidth={2} aria-hidden />
            </button>
            <div className={styles.viewToggle} role="group" aria-label="Mode d’affichage">
              <button
                type="button"
                className={[styles.viewBtn, vueGrille ? styles.viewBtnOn : ""].join(" ")}
                onClick={() => setVueGrille(true)}
                title="Grille"
                aria-pressed={vueGrille}
              >
                <Grid3x3 size={18} strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                className={[styles.viewBtn, !vueGrille ? styles.viewBtnOn : ""].join(" ")}
                onClick={() => setVueGrille(false)}
                title="Liste"
                aria-pressed={!vueGrille}
              >
                <LayoutList size={18} strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <p className={styles.summaryText}>
          <span className={styles.summaryLead}>
            <strong>{filtrees.length}</strong>{" "}
            {filtrees.length === 1 ? "ressource affichée" : "ressources affichées"}
          </span>
          <span className={styles.summarySub}>
            {" "}
            · <strong>{nombreSelection}</strong>{" "}
            {nombreSelection === 1 ? "sélectionnée" : "sélectionnées"} pour l’accueil (max {MAX_SELECTION})
          </span>
        </p>
        <button
          type="button"
          className={[
            styles.saveSelectionButton,
            isSelectionReady ? styles.saveSelectionButtonVisible : "",
          ].join(" ")}
          onClick={enregistrerSelection}
          aria-label="Enregistrer les images de l’accueil"
          title="Enregistrer la sélection"
          disabled={!isSelectionReady || setFeaturedAccueil.isPending}
          aria-hidden={!isSelectionReady}
          tabIndex={isSelectionReady ? 0 : -1}
        >
          {setFeaturedAccueil.isPending ? (
            <BeatLoader size={7} color="#ffffff" loading={setFeaturedAccueil.isPending} aria-label="Enregistrement en cours" />
          ) : (
            <>
              <Save size={18} strokeWidth={2.25} aria-hidden />
              <span className={styles.saveSelectionLabel}>Enregistrer</span>
            </>
          )}
        </button>
      </div>
      {isLoading ? <p className={styles.empty}>Chargement des visuels...</p> : null}

      <ul
        className={[styles.grid, vueGrille ? "" : styles.gridList].join(" ")}
        aria-label="Bibliothèque d’images"
      >
        {filtrees.map((img) => {
          const selectionId = getSelectionId(img)
          const selected = selection.has(selectionId)
          return (
            <li key={img.id} className={styles.card}>
              <div
                className={[styles.thumbBtn, selected ? styles.thumbBtnSelected : ""].join(" ")}
                onClick={() => toggleSelection(selectionId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggleSelection(selectionId)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={
                  selected
                    ? `Retirer « ${img.alt} » de l’accueil`
                    : `Ajouter « ${img.alt} » à l’accueil`
                }
              >
                <span className={styles.thumbAspect}>
                  <span className={styles.thumbInner}>
                    <img className={styles.thumbImg} src={img.src} alt="" loading="lazy" decoding="async" />
                  </span>
                  <button
                    type="button"
                    className={styles.removeOnThumb}
                    onClick={(e) => {
                      e.stopPropagation()
                      supprimerImage(img)
                    }}
                    aria-label={`Supprimer « ${img.alt} »`}
                    disabled={!img.deleteId || deleteAccueil.isPending}
                  >
                    <Trash2 size={16} strokeWidth={2} aria-hidden />
                  </button>
                  {img.dejaUtilisee ? (
                    <span className={styles.badgeUsed}>Déjà utilisée sur l’accueil</span>
                  ) : null}
                  {selected ? (
                    <span className={styles.checkOverlay} aria-hidden>
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                  ) : null}
                </span>
              </div>
              <p className={styles.caption} title={img.alt}>
                {img.alt}
              </p>
            </li>
          )
        })}
      </ul>

      {filtrees.length === 0 ? (
        <p className={styles.empty}>Aucun résultat pour cette recherche.</p>
      ) : null}

      <button
        type="button"
        className={styles.fab}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        aria-label="Ajouter des images"
      >
        <Plus size={16} strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  )
}

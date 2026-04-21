import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"
import {
  Check,
  CheckSquare,
  Grid3x3,
  LayoutList,
  Plus,
  RefreshCw,
  Search,
  Square,
  Trash2,
  Upload,
} from "lucide-react"
import Masonry from "react-masonry-css"
// import { Link } from "react-router-dom"
import accueilStyles from "@/pages/accueil/AccueilPage.module.css"
import { useCreateGalerie, useDeleteGalerie, useGalerieList } from "@/features/galerie/hooks/useGalerie"
import type { GalerieItem } from "@/features/galerie/api/galerie.types"
import galerieStyles from "./GaleriePage.module.css"

const MASONRY_BREAKPOINTS = {
  default: 4,
  1180: 3,
  900: 2,
  640: 1,
}

type GaleriePhotoSite = {
  id: string
  src: string
  alt?: string
  ajouteeLe: string
}

function buildPublicBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? ""
  if (!raw) return window.location.origin
  try {
    const url = new URL(raw)
    const withoutApiSuffix = url.pathname.replace(/\/api\/?$/, "")
    return `${url.origin}${withoutApiSuffix}`.replace(/\/+$/, "")
  } catch {
    return window.location.origin
  }
}

function resolveImageUrl(path?: string): string {
  const value = path?.trim()
  if (!value) return ""
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value
  }
  const cleaned = value.replace(/^\/+/, "")
  return `${buildPublicBaseUrl()}/${cleaned}`
}

function mapGalerieItem(item: GalerieItem, index: number): GaleriePhotoSite | null {
  const id =
    item.galerie_id ??
    item.id ??
    `${item.image ?? item.src ?? "gal"}-${item.nom ?? "image"}-${index}`
  const src = resolveImageUrl(item.image ?? item.src)
  if (!id || !src) return null
  return {
    id,
    src,
    alt: item.nom,
    ajouteeLe: item.createdAt ?? item.ajouteeLe ?? new Date(0).toISOString(),
  }
}

function legendeSite(p: GaleriePhotoSite): string {
  const a = p.alt?.trim()
  if (a) return a
  return "Image galerie"
}

export function GaleriePage() {
  const searchSiteId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchSiteRef = useRef<HTMLInputElement>(null)
  const { data, isLoading, isFetching, refetch, error } = useGalerieList()
  const createGalerie = useCreateGalerie()
  const deleteGalerie = useDeleteGalerie()
  const [querySite, setQuerySite] = useState("")
  const [triSite] = useState<"pertinence" | "recent">("pertinence")
  const [vueGrilleSite, setVueGrilleSite] = useState(true)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const [dragActif, setDragActif] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadingCount, setUploadingCount] = useState(0)

  const photosSite = useMemo(
    () => (data ?? []).map(mapGalerieItem).filter((x): x is GaleriePhotoSite => x !== null),
    [data],
  )

  const photosSiteFiltrees = useMemo(() => {
    const q = querySite.trim().toLowerCase()
    let list = photosSite
    if (q) {
      list = list.filter((p) => {
        const alt = (p.alt ?? "").toLowerCase()
        return (
          alt.includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.src.toLowerCase().includes(q)
        )
      })
    }
    const copy = [...list]
    if (triSite === "recent") {
      copy.sort((a, b) => (a.ajouteeLe < b.ajouteeLe ? 1 : a.ajouteeLe > b.ajouteeLe ? -1 : 0))
    }
    return copy
  }, [photosSite, querySite, triSite])

  const traiterFichiers = useCallback(async (files: FileList | File[]) => {
    if (!files.length) return
    setUploadError(null)
    setUploadingCount(files.length)
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (!f.type.startsWith("image/")) continue
      const nom = f.name.replace(/\.[^.]+$/, "") || "Image importee"
      await createGalerie.mutateAsync({ nom, image: f })
      setUploadingCount((prev) => Math.max(0, prev - 1))
    }
    await refetch()
    setUploadingCount(0)
  }, [createGalerie, refetch])

  const ajouterFichiers = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files?.length) return
      try {
        await traiterFichiers(files)
      } catch {
        setUploadError("Le televersement a echoue.")
      }
      e.target.value = ""
    },
    [traiterFichiers],
  )

  const supprimerPhotoSite = useCallback((id: string) => {
    if (!window.confirm("Retirer cette image de la galerie du site ?")) return
    deleteGalerie
      .mutateAsync(id)
      .then(() => refetch())
      .catch(() => {
        setUploadError("La suppression a echoue.")
      })
  }, [deleteGalerie, refetch])

  const supprimerSelection = useCallback(() => {
    if (selection.size === 0) return
    const texte =
      selection.size === 1
        ? "Retirer l’image sélectionnée de la galerie ?"
        : `Retirer les ${selection.size} images sélectionnées de la galerie ?`
    if (!window.confirm(texte)) return
    const ids = [...selection]
    Promise.all(ids.map((id) => deleteGalerie.mutateAsync(id)))
      .then(() => refetch())
      .then(() => {
        setSelection(new Set())
        setSelectionMode(false)
      })
      .catch(() => {
        setUploadError("Une ou plusieurs suppressions ont echoue.")
      })
  }, [deleteGalerie, refetch, selection])

  const toggleSelection = useCallback((id: string) => {
    setSelection((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toutSelectionner = useCallback(() => {
    setSelection(new Set(photosSiteFiltrees.map((p) => p.id)))
  }, [photosSiteFiltrees])

  const annulerSelection = useCallback(() => {
    setSelection(new Set())
  }, [])

  const dragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    if (!e.dataTransfer.types.includes("Files")) return
    e.preventDefault()
    setDragActif(true)
  }, [])

  const dragOver = useCallback((e: DragEvent<HTMLElement>) => {
    if (!e.dataTransfer.types.includes("Files")) return
    e.preventDefault()
    setDragActif(true)
  }, [])

  const dragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setDragActif(false)
  }, [])

  const drop = useCallback(
    async (e: DragEvent<HTMLElement>) => {
      if (!e.dataTransfer.files?.length) return
      e.preventDefault()
      setDragActif(false)
      await traiterFichiers(e.dataTransfer.files)
    },
    [traiterFichiers],
  )

  const aucunMedia = photosSite.length === 0
  const aucunResultat = photosSite.length > 0 && photosSiteFiltrees.length === 0

  return (
    <div className={accueilStyles.wrap}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className={accueilStyles.fileInput}
        onChange={ajouterFichiers}
        aria-hidden
        tabIndex={-1}
      />

      <div className={galerieStyles.section}>
        <h3 className={galerieStyles.sectionLead}>Galerie du site</h3>
        <p className={galerieStyles.sectionHint}>Dépose tes images, organise-les et publie rapidement.</p>

        <div className={accueilStyles.toolbarTop}>
          <div className={accueilStyles.searchRow}>
            <div className={accueilStyles.searchBar}>
              <label className={accueilStyles.search} htmlFor={searchSiteId}>
                <Search className={accueilStyles.searchIcon} size={17} strokeWidth={1.75} aria-hidden />
                <input
                  ref={searchSiteRef}
                  id={searchSiteId}
                  type="search"
                  className={accueilStyles.searchInput}
                  placeholder="Nom, légende ou URL…"
                  value={querySite}
                  onChange={(e) => setQuerySite(e.target.value)}
                  autoComplete="off"
                />
              </label>
            </div>
            <button
              type="button"
              className={accueilStyles.uploadButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={createGalerie.isPending}
            >
              <Upload size={17} strokeWidth={2} aria-hidden />
              {createGalerie.isPending ? "Import en cours..." : "Televerser"}
            </button>
          </div>

          <div className={galerieStyles.smartActions}>
            <button type="button" className={accueilStyles.iconGhost} onClick={() => searchSiteRef.current?.focus()}>
              <Search size={18} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className={accueilStyles.iconGhost}
              title="Actualiser la galerie"
              aria-label="Actualiser la galerie"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw size={18} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className={galerieStyles.secondaryBtn}
              onClick={() => {
                setSelectionMode((prev) => !prev)
                setSelection(new Set())
              }}
            >
              {selectionMode ? <CheckSquare size={16} aria-hidden /> : <Square size={16} aria-hidden />}
              {selectionMode ? "Quitter la sélection" : "Multi-sélection"}
            </button>
            {selectionMode ? (
              <>
                <button type="button" className={galerieStyles.secondaryBtn} onClick={toutSelectionner}>
                  Tout sélectionner
                </button>
                <button type="button" className={galerieStyles.secondaryBtn} onClick={annulerSelection}>
                  Vider
                </button>
                <button
                  type="button"
                  className={galerieStyles.dangerBtn}
                  onClick={supprimerSelection}
                  disabled={selection.size === 0}
                >
                  <Trash2 size={16} strokeWidth={2} aria-hidden />
                  Supprimer ({selection.size})
                </button>
              </>
            ) : null}
            <div className={accueilStyles.viewToggle} role="group" aria-label="Mode d’affichage galerie site">
              <button
                type="button"
                className={[accueilStyles.viewBtn, vueGrilleSite ? accueilStyles.viewBtnOn : ""].join(" ")}
                onClick={() => setVueGrilleSite(true)}
                title="Grille"
                aria-pressed={vueGrilleSite}
              >
                <Grid3x3 size={18} strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                className={[accueilStyles.viewBtn, !vueGrilleSite ? accueilStyles.viewBtnOn : ""].join(" ")}
                onClick={() => setVueGrilleSite(false)}
                title="Liste"
                aria-pressed={!vueGrilleSite}
              >
                <LayoutList size={18} strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>

          {uploadError ? <p className={galerieStyles.emptyText}>{uploadError}</p> : null}
          {error ? <p className={galerieStyles.emptyText}>Impossible de charger la galerie.</p> : null}
          {isLoading ? <p className={galerieStyles.emptyText}>Chargement de la galerie...</p> : null}
          {createGalerie.isPending ? (
            <div className={galerieStyles.uploadStatus} role="status" aria-live="polite">
              <p>
                Televersement en cours...
                {uploadingCount > 0
                  ? ` (${uploadingCount} restant${uploadingCount > 1 ? "s" : ""})`
                  : ""}
              </p>
              <div className={galerieStyles.progressTrack}>
                <span className={galerieStyles.progressFill} style={{ width: "65%" }} />
              </div>
            </div>
          ) : null}
        </div>

        <div className={accueilStyles.summaryBar}>
          <p className={accueilStyles.summaryText}>
            <span className={accueilStyles.summaryLead}>
              <strong>{photosSiteFiltrees.length}</strong>{" "}
              {photosSiteFiltrees.length === 1 ? "visuel affiché" : "visuels affichés"}
            </span>
            <span className={accueilStyles.summarySub}> · Galerie publique</span>
          </p>
        </div>

        <section
          className={[galerieStyles.dropZone, dragActif ? galerieStyles.dropZoneActive : ""].join(" ")}
          onDragEnter={dragEnter}
          onDragOver={dragOver}
          onDragLeave={dragLeave}
          onDrop={drop}
        >
          {aucunMedia ? (
            <div className={galerieStyles.emptyState}>
              <p className={galerieStyles.emptyTitle}>Ta galerie est vide</p>
              <p className={galerieStyles.emptyText}>
                Ajoute des photos pour alimenter la galerie publique. Le glisser-déposer fonctionne aussi depuis ton
                bureau.
              </p>
              <button type="button" className={accueilStyles.uploadButton} onClick={() => fileInputRef.current?.click()}>
                <Upload size={17} strokeWidth={2} aria-hidden />
                Ajouter les premières images
              </button>
            </div>
          ) : aucunResultat ? (
            <div className={galerieStyles.emptyState}>
              <p className={galerieStyles.emptyTitle}>Aucun résultat</p>
              <p className={galerieStyles.emptyText}>Aucune image ne correspond à ta recherche actuelle.</p>
              <button type="button" className={galerieStyles.secondaryBtn} onClick={() => setQuerySite("")}>
                Réinitialiser la recherche
              </button>
            </div>
          ) : vueGrilleSite ? (
            <Masonry
              breakpointCols={MASONRY_BREAKPOINTS}
              className={galerieStyles.masonryGrid}
              columnClassName={galerieStyles.masonryColumn}
              role="list"
              aria-label="Galerie du site"
            >
              {photosSiteFiltrees.map((p) => {
                const cap = legendeSite(p)
                const isSelected = selection.has(p.id)
                return (
                  <article key={p.id} className={galerieStyles.masonryCard} role="listitem">
                    <div
                      className={[accueilStyles.thumbBtn, isSelected ? accueilStyles.thumbBtnSelected : ""].join(" ")}
                      onClick={() => selectionMode && toggleSelection(p.id)}
                      role={selectionMode ? "button" : undefined}
                      tabIndex={selectionMode ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (!selectionMode) return
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          toggleSelection(p.id)
                        }
                      }}
                    >
                      <span className={galerieStyles.masonryAspect}>
                        <img
                          className={galerieStyles.masonryImg}
                          src={p.src}
                          alt={cap}
                          loading="lazy"
                          decoding="async"
                        />
                        {selectionMode ? (
                          <span className={galerieStyles.selectBadge} aria-hidden>
                            {isSelected ? <Check size={15} strokeWidth={2.75} /> : null}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          className={galerieStyles.removeOnThumb}
                          onClick={(e) => {
                            e.stopPropagation()
                            supprimerPhotoSite(p.id)
                          }}
                          aria-label={`Retirer « ${cap} » de la galerie`}
                        >
                          <Trash2 size={16} strokeWidth={2} aria-hidden />
                        </button>
                      </span>
                    </div>
                  </article>
                )
              })}
            </Masonry>
          ) : (
            <ul className={[accueilStyles.grid, accueilStyles.gridList].join(" ")} aria-label="Galerie du site">
              {photosSiteFiltrees.map((p) => {
                const cap = legendeSite(p)
                const isSelected = selection.has(p.id)
                return (
                  <li key={p.id} className={accueilStyles.card}>
                    <div
                      className={[accueilStyles.thumbBtn, isSelected ? accueilStyles.thumbBtnSelected : ""].join(" ")}
                      onClick={() => selectionMode && toggleSelection(p.id)}
                      role={selectionMode ? "button" : undefined}
                      tabIndex={selectionMode ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (!selectionMode) return
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          toggleSelection(p.id)
                        }
                      }}
                    >
                      <span className={accueilStyles.thumbAspect}>
                        <span className={accueilStyles.thumbInner}>
                          <img
                            className={accueilStyles.thumbImg}
                            src={p.src}
                            alt={cap}
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                        {selectionMode ? (
                          <span className={galerieStyles.selectBadge} aria-hidden>
                            {isSelected ? <Check size={15} strokeWidth={2.75} /> : null}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          className={galerieStyles.removeOnThumb}
                          onClick={(e) => {
                            e.stopPropagation()
                            supprimerPhotoSite(p.id)
                          }}
                          aria-label={`Retirer « ${cap} » de la galerie`}
                        >
                          <Trash2 size={16} strokeWidth={2} aria-hidden />
                        </button>
                      </span>
                    </div>
                    <p className={accueilStyles.caption} title={cap}>
                      {cap}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <button
          type="button"
          className={accueilStyles.fab}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Ajouter des images à la galerie"
        >
          <Plus size={16} strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </div>
  )
}

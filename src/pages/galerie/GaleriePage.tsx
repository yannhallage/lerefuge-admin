import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import {
  Bookmark,
  ChevronDown,
  Grid3x3,
  LayoutList,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import Masonry from "react-masonry-css"
// import { Link } from "react-router-dom"
import accueilStyles from "@/pages/accueil/AccueilPage.module.css"
import {
  loadGalerieSite,
  saveGalerieSite,
  type GaleriePhotoSite,
} from "./galerieStorage"
import galerieStyles from "./GaleriePage.module.css"

const FILTRES_PRINCIPAUX = ["Dossiers", "Étiquettes", "Formats", "Date de création", "Types de médias"] as const
const MASONRY_BREAKPOINTS = {
  default: 4,
  1180: 3,
  900: 2,
  640: 1,
}

function fileVersDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
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
  const [photosSite, setPhotosSite] = useState<GaleriePhotoSite[]>(loadGalerieSite)
  const [querySite, setQuerySite] = useState("")
  const [triSite] = useState<"pertinence" | "recent">("pertinence")
  const [vueGrilleSite, setVueGrilleSite] = useState(true)

  useEffect(() => {
    saveGalerieSite(photosSite)
  }, [photosSite])

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

  const ajouterFichiers = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const now = new Date().toISOString()
    const nouvelles: GaleriePhotoSite[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (!f.type.startsWith("image/")) continue
      nouvelles.push({
        id: `gal-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        src: await fileVersDataUrl(f),
        alt: f.name.replace(/\.[^.]+$/, "") || "Image importée",
        ajouteeLe: now,
      })
    }
    if (nouvelles.length) {
      setPhotosSite((prev) => [...nouvelles, ...prev])
    }
    e.target.value = ""
  }, [])

  const supprimerPhotoSite = useCallback((id: string) => {
    if (!window.confirm("Retirer cette image de la galerie du site ?")) return
    setPhotosSite((prev) => prev.filter((p) => p.id !== id))
  }, [])

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
        <p className={galerieStyles.sectionHint}>
          Photos gérées sur cette page. Icône corbeille sur chaque vignette pour retirer l’image.
        </p>

        <div className={accueilStyles.breadcrumbRow}>
          <nav className={accueilStyles.breadcrumb} aria-label="Fil d’Ariane">
            <span className={accueilStyles.breadcrumbMuted}>Médiathèque</span>
            <span className={accueilStyles.breadcrumbSep} aria-hidden>
              &gt;
            </span>
            <span>Galerie site</span>
          </nav>
          <button
            type="button"
            className={accueilStyles.quickSearchBtn}
            aria-label="Aller à la recherche"
            onClick={() => searchSiteRef.current?.focus()}
          >
            <Search size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

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
            <div className={accueilStyles.addWrap}>
              <button
                type="button"
                className={accueilStyles.uploadButton}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={17} strokeWidth={2} aria-hidden />
                Téléverser
              </button>
            </div>
          </div>

          <div className={accueilStyles.filtersPrimary} role="group" aria-label="Filtres">
            {FILTRES_PRINCIPAUX.map((label) => (
              <button key={label} type="button" className={accueilStyles.filterPill} disabled>
                {label}
                <ChevronDown className={accueilStyles.filterChevron} size={14} strokeWidth={2} aria-hidden />
              </button>
            ))}
          </div>

          <div className={accueilStyles.filtersSecondary} role="group" aria-label="Filtres complémentaires">
            <button type="button" className={accueilStyles.filterPill} disabled>
              Plus
              <ChevronDown className={accueilStyles.filterChevron} size={14} strokeWidth={2} aria-hidden />
            </button>
            <button type="button" className={accueilStyles.filterPillSaved} disabled>
              <Bookmark className={accueilStyles.filterBookmark} size={14} strokeWidth={2} aria-hidden />
              Enregistrés
            </button>
          </div>

          <div className={accueilStyles.actionsRow}>
            <button
              type="button"
              className={accueilStyles.iconGhost}
              title="Relire la galerie depuis le stockage"
              aria-label="Relire la galerie depuis le stockage"
              onClick={() => setPhotosSite(loadGalerieSite())}
            >
              <RefreshCw size={18} strokeWidth={2} aria-hidden />
            </button>
            <div className={accueilStyles.actionsRight}>
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
          </div>
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

        {vueGrilleSite ? (
          <Masonry
            breakpointCols={MASONRY_BREAKPOINTS}
            className={galerieStyles.masonryGrid}
            columnClassName={galerieStyles.masonryColumn}
            role="list"
            aria-label="Galerie du site"
          >
            {photosSiteFiltrees.map((p) => {
              const cap = legendeSite(p)
              return (
                <article key={p.id} className={galerieStyles.masonryCard} role="listitem">
                  <div className={accueilStyles.thumbBtn}>
                    <span className={galerieStyles.masonryAspect}>
                      <img
                        className={galerieStyles.masonryImg}
                        src={p.src}
                        alt={cap}
                        loading="lazy"
                        decoding="async"
                      />
                      <button
                        type="button"
                        className={galerieStyles.removeOnThumb}
                        onClick={() => supprimerPhotoSite(p.id)}
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
              return (
                <li key={p.id} className={accueilStyles.card}>
                  <div className={accueilStyles.thumbBtn}>
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
                      <button
                        type="button"
                        className={galerieStyles.removeOnThumb}
                        onClick={() => supprimerPhotoSite(p.id)}
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

        {photosSiteFiltrees.length === 0 ? (
          <p className={accueilStyles.empty}>Aucun résultat pour cette recherche.</p>
        ) : null}

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

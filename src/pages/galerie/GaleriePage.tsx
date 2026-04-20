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
import { Link } from "react-router-dom"
import accueilStyles from "@/pages/accueil/AccueilPage.module.css"
import { loadLogements } from "@/pages/logements/logementStorage"
import {
  loadGalerieSite,
  saveGalerieSite,
  type GaleriePhotoSite,
} from "./galerieStorage"
import galerieStyles from "./GaleriePage.module.css"

const FILTRES_PRINCIPAUX = ["Dossiers", "Étiquettes", "Formats", "Date de création", "Types de médias"] as const

function fileVersDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

type ImageLogement = {
  cle: string
  src: string
  logementNom: string
}

function collecterImagesLogements(): ImageLogement[] {
  const vus = new Set<string>()
  const out: ImageLogement[] = []
  for (const l of loadLogements()) {
    const urls = [...l.photosPresentation, ...l.galeriePhotos].filter((u) => typeof u === "string" && u.trim())
    for (const src of urls) {
      const s = src.trim()
      if (vus.has(s)) continue
      vus.add(s)
      out.push({
        cle: `${l.id}-${s.length}-${s.slice(-24)}`,
        src: s,
        logementNom: l.nom,
      })
    }
  }
  return out
}

function legendeSite(p: GaleriePhotoSite): string {
  const a = p.alt?.trim()
  if (a) return a
  return "Image galerie"
}

export function GaleriePage() {
  const searchSiteId = useId()
  const searchLogementsId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchSiteRef = useRef<HTMLInputElement>(null)
  const searchLogementsRef = useRef<HTMLInputElement>(null)

  const [photosSite, setPhotosSite] = useState<GaleriePhotoSite[]>(loadGalerieSite)
  const [imagesLogements, setImagesLogements] = useState<ImageLogement[]>(collecterImagesLogements)
  const [querySite, setQuerySite] = useState("")
  const [queryLogements, setQueryLogements] = useState("")
  const [triSite, setTriSite] = useState<"pertinence" | "recent">("pertinence")
  const [triLogements, setTriLogements] = useState<"pertinence" | "recent">("pertinence")
  const [vueGrilleSite, setVueGrilleSite] = useState(true)
  const [vueGrilleLogements, setVueGrilleLogements] = useState(true)

  useEffect(() => {
    saveGalerieSite(photosSite)
  }, [photosSite])

  const rafraichirLogements = useCallback(() => {
    setImagesLogements(collecterImagesLogements())
  }, [])

  useEffect(() => {
    const onFocus = () => rafraichirLogements()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [rafraichirLogements])

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

  const logementsFiltres = useMemo(() => {
    const q = queryLogements.trim().toLowerCase()
    let list = imagesLogements
    if (q) {
      list = list.filter(
        (x) => x.logementNom.toLowerCase().includes(q) || x.src.toLowerCase().includes(q),
      )
    }
    const copy = [...list]
    if (triLogements === "recent") {
      copy.reverse()
    }
    return copy
  }, [imagesLogements, queryLogements, triLogements])

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

      <section className={accueilStyles.intro} aria-labelledby="galerie-intro-title">
        <h2 id="galerie-intro-title" className={accueilStyles.introTitle}>
          Galerie
        </h2>
        <p className={accueilStyles.introText}>
          Même affichage que la médiathèque Accueil : vignettes carrées, image entière visible (sans recadrage
          agressif), légende sous chaque visuel. Téléversez des fichiers pour enrichir la galerie du site
          (stockage local).
        </p>
      </section>

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
              <label className={accueilStyles.sortLabel}>
                <span className={accueilStyles.srOnly}>Tri galerie site</span>
                <select
                  className={accueilStyles.sortSelect}
                  value={triSite}
                  onChange={(e) => setTriSite(e.target.value as "pertinence" | "recent")}
                >
                  <option value="pertinence">Pertinence</option>
                  <option value="recent">Plus récent</option>
                </select>
              </label>
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

        <ul
          className={[accueilStyles.grid, vueGrilleSite ? "" : accueilStyles.gridList].join(" ")}
          aria-label="Galerie du site"
        >
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
                        alt=""
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

      <div className={galerieStyles.section}>
        <h3 className={galerieStyles.sectionLead}>Images des logements</h3>
        <p className={galerieStyles.sectionHint}>
          Aperçu des photos des fiches (présentation + galerie). Modifier une image : page{" "}
          <Link className={galerieStyles.inlineLink} to="/logements">
            Logements
          </Link>
          .
        </p>

        <div className={accueilStyles.breadcrumbRow}>
          <nav className={accueilStyles.breadcrumb} aria-label="Fil d’Ariane">
            <span className={accueilStyles.breadcrumbMuted}>Médiathèque</span>
            <span className={accueilStyles.breadcrumbSep} aria-hidden>
              &gt;
            </span>
            <span>Logements</span>
          </nav>
          <button
            type="button"
            className={accueilStyles.quickSearchBtn}
            aria-label="Aller à la recherche"
            onClick={() => searchLogementsRef.current?.focus()}
          >
            <Search size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <div className={accueilStyles.toolbarTop}>
          <div className={accueilStyles.searchRow}>
            <div className={accueilStyles.searchBar}>
              <label className={accueilStyles.search} htmlFor={searchLogementsId}>
                <Search className={accueilStyles.searchIcon} size={17} strokeWidth={1.75} aria-hidden />
                <input
                  ref={searchLogementsRef}
                  id={searchLogementsId}
                  type="search"
                  className={accueilStyles.searchInput}
                  placeholder="Filtrer par nom de logement…"
                  value={queryLogements}
                  onChange={(e) => setQueryLogements(e.target.value)}
                  autoComplete="off"
                />
              </label>
            </div>
            <div className={accueilStyles.addWrap}>
              <button type="button" className={galerieStyles.refreshBtn} onClick={rafraichirLogements}>
                <RefreshCw size={17} strokeWidth={2} aria-hidden />
                Actualiser
              </button>
            </div>
          </div>

          <div className={accueilStyles.filtersPrimary} role="group" aria-label="Filtres">
            {FILTRES_PRINCIPAUX.map((label) => (
              <button key={`log-${label}`} type="button" className={accueilStyles.filterPill} disabled>
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
              title="Actualiser la liste depuis les logements"
              aria-label="Actualiser la liste depuis les logements"
              onClick={rafraichirLogements}
            >
              <RefreshCw size={18} strokeWidth={2} aria-hidden />
            </button>
            <div className={accueilStyles.actionsRight}>
              <label className={accueilStyles.sortLabel}>
                <span className={accueilStyles.srOnly}>Tri images logements</span>
                <select
                  className={accueilStyles.sortSelect}
                  value={triLogements}
                  onChange={(e) => setTriLogements(e.target.value as "pertinence" | "recent")}
                >
                  <option value="pertinence">Pertinence</option>
                  <option value="recent">Plus récent</option>
                </select>
              </label>
              <div className={accueilStyles.viewToggle} role="group" aria-label="Mode d’affichage logements">
                <button
                  type="button"
                  className={[accueilStyles.viewBtn, vueGrilleLogements ? accueilStyles.viewBtnOn : ""].join(" ")}
                  onClick={() => setVueGrilleLogements(true)}
                  title="Grille"
                  aria-pressed={vueGrilleLogements}
                >
                  <Grid3x3 size={18} strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  className={[accueilStyles.viewBtn, !vueGrilleLogements ? accueilStyles.viewBtnOn : ""].join(" ")}
                  onClick={() => setVueGrilleLogements(false)}
                  title="Liste"
                  aria-pressed={!vueGrilleLogements}
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
              <strong>{logementsFiltres.length}</strong>{" "}
              {logementsFiltres.length === 1 ? "image listée" : "images listées"}
            </span>
            <span className={accueilStyles.summarySub}> · Source fiches logements</span>
          </p>
        </div>

        <ul
          className={[accueilStyles.grid, vueGrilleLogements ? "" : accueilStyles.gridList].join(" ")}
          aria-label="Images des logements"
        >
          {logementsFiltres.map((x) => (
            <li key={x.cle} className={accueilStyles.card}>
              <Link
                to="/logements"
                className={`${accueilStyles.thumbBtn} ${galerieStyles.thumbLink}`}
                title={`Gérer dans : ${x.logementNom}`}
              >
                <span className={accueilStyles.thumbAspect}>
                  <span className={accueilStyles.thumbInner}>
                    <img
                      className={accueilStyles.thumbImg}
                      src={x.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className={accueilStyles.badgeUsed}>Logement</span>
                </span>
              </Link>
              <p className={accueilStyles.caption} title={x.logementNom}>
                {x.logementNom}
              </p>
            </li>
          ))}
        </ul>

        {logementsFiltres.length === 0 ? (
          <p className={accueilStyles.empty}>Aucune image de logement ou aucun résultat pour ce filtre.</p>
        ) : null}
      </div>
    </div>
  )
}

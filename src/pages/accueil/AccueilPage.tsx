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
  Check,
  ChevronDown,
  Download,
  Grid3x3,
  LayoutList,
  Plus,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react"
import styles from "./AccueilPage.module.css"

const STORAGE_KEY = "lerefuge-accueil-images-selection"

export type AccueilLibraryImage = {
  id: string
  src: string
  alt: string
  /** Indique qu’une version de ce visuel est déjà publiée sur l’accueil client */
  dejaUtilisee?: boolean
}

const BIBLIOTHEQUE_PAR_DEFAUT: AccueilLibraryImage[] = [
  {
    id: "def-kit",
    src: "/accueil-kit-reference.png",
    alt: "Accessoires photo et vidéo disposés sur fond clair",
    dejaUtilisee: true,
  },
  {
    id: "def-malette",
    src: "https://images.unsplash.com/photo-1583394838336-acd977736f7d?auto=format&fit=crop&w=720&q=80",
    alt: "Malette professionnelle pour équipement photo",
  },
  {
    id: "def-gimbal",
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=720&q=80",
    alt: "Appareil photo sur stabilisateur",
  },
  {
    id: "def-detail",
    src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=720&q=80",
    alt: "Gros plan sur du matériel vidéo professionnel",
  },
  {
    id: "def-micro",
    src: "https://images.unsplash.com/photo-1598387993441-a364f854c3e0?auto=format&fit=crop&w=720&q=80",
    alt: "Microphone et accessoires audio",
  },
]

function loadSelection(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return new Set(BIBLIOTHEQUE_PAR_DEFAUT.filter((i) => i.dejaUtilisee).map((i) => i.id))
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((x): x is string => typeof x === "string"))
  } catch {
    return new Set(BIBLIOTHEQUE_PAR_DEFAUT.filter((i) => i.dejaUtilisee).map((i) => i.id))
  }
}

function saveSelection(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

const FILTRES_PRINCIPAUX = ["Dossiers", "Étiquettes", "Formats", "Date de création", "Types de médias"] as const

export function AccueilPage() {
  const searchId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [tri, setTri] = useState<"pertinence" | "recent">("pertinence")
  const [vueGrille, setVueGrille] = useState(true)
  const [images, setImages] = useState<AccueilLibraryImage[]>(BIBLIOTHEQUE_PAR_DEFAUT)
  const [selection, setSelection] = useState<Set<string>>(loadSelection)

  useEffect(() => {
    saveSelection(selection)
  }, [selection])

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
      else next.add(id)
      return next
    })
  }, [])

  const handleFichiers = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const nouvelles: AccueilLibraryImage[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith("image/")) continue
      const url = URL.createObjectURL(file)
      nouvelles.push({
        id: `upload-${file.name}-${Date.now()}-${i}`,
        src: url,
        alt: file.name.replace(/\.[^.]+$/, "") || "Image importée",
      })
    }
    if (nouvelles.length) {
      setImages((prev) => [...nouvelles, ...prev])
      setSelection((prev) => {
        const next = new Set(prev)
        nouvelles.forEach((n) => next.add(n.id))
        return next
      })
    }
    e.target.value = ""
  }, [])

  const nombreSelection = selection.size

  return (
    <div className={styles.wrap}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.fileInput}
        onChange={handleFichiers}
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
            >
              <Upload size={17} strokeWidth={2} aria-hidden />
              Téléverser
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
          <button type="button" className={styles.iconGhost} title="Actualiser" aria-label="Actualiser">
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
            {nombreSelection === 1 ? "sélectionnée" : "sélectionnées"} pour l’accueil
          </span>
        </p>
      </div>

      <ul
        className={[styles.grid, vueGrille ? "" : styles.gridList].join(" ")}
        aria-label="Bibliothèque d’images"
      >
        {filtrees.map((img) => {
          const selected = selection.has(img.id)
          return (
            <li key={img.id} className={styles.card}>
              <button
                type="button"
                className={[styles.thumbBtn, selected ? styles.thumbBtnSelected : ""].join(" ")}
                onClick={() => toggleSelection(img.id)}
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
                  {img.dejaUtilisee ? (
                    <span className={styles.badgeUsed}>Déjà utilisée sur l’accueil</span>
                  ) : null}
                  {selected ? (
                    <span className={styles.checkOverlay} aria-hidden>
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                  ) : null}
                </span>
              </button>
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
        aria-label="Ajouter des images"
      >
        <Plus size={16} strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  )
}

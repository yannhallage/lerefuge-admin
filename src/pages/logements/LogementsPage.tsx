import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { BedDouble, ImagePlus, Pencil, Trash2, X } from "lucide-react"
// import { IconPlusButton } from "@/shared/ui/IconPlusButton/IconPlusButton"
import styles from "./LogementsPage.module.css"

const STORAGE_KEY = "lerefuge-logements-v1"

export type Logement = {
  id: string
  nom: string
  /** Prix affiché (nombre, devise gérée à l’affichage) */
  prix: number
  /** Deux photos de présentation */
  photosPresentation: [string, string]
  /** Galerie « critères » / visuels du logement */
  galeriePhotos: string[]
  descriptionChambre: string
}

const EXEMPLES: Logement[] = [
  {
    id: "demo-1",
    nom: "Chambre vue jardin",
    prix: 85,
    photosPresentation: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    ],
    galeriePhotos: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    ],
    descriptionChambre:
      "Chambre lumineuse avec lit double, salle d’eau privative et vue sur le jardin. Idéale pour un séjour calme.",
  },
]

function loadLogements(): Logement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EXEMPLES
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return EXEMPLES
    return parsed.filter(isLogementValide)
  } catch {
    return EXEMPLES
  }
}

function isLogementValide(x: unknown): x is Logement {
  if (!x || typeof x !== "object") return false
  const o = x as Record<string, unknown>
  if (typeof o.id !== "string" || typeof o.nom !== "string") return false
  if (typeof o.prix !== "number" || Number.isNaN(o.prix)) return false
  if (typeof o.descriptionChambre !== "string") return false
  if (!Array.isArray(o.photosPresentation) || o.photosPresentation.length !== 2) return false
  if (!o.photosPresentation.every((p) => typeof p === "string")) return false
  if (!Array.isArray(o.galeriePhotos) || !o.galeriePhotos.every((p) => typeof p === "string")) return false
  return true
}

function saveLogements(items: Logement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function fileVersDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}

const VIDE: Omit<Logement, "id"> = {
  nom: "",
  prix: 0,
  photosPresentation: ["", ""],
  galeriePhotos: [],
  descriptionChambre: "",
}

type ModeForm = "ferme" | "creation" | "edition"

export function LogementsPage() {
  const baseId = useId()
  const [liste, setListe] = useState<Logement[]>(loadLogements)
  const [mode, setMode] = useState<ModeForm>("ferme")
  const [editionId, setEditionId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Logement, "id">>(VIDE)
  const [query, setQuery] = useState("")

  useEffect(() => {
    saveLogements(liste)
  }, [liste])

  const filtres = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return liste
    return liste.filter(
      (l) =>
        l.nom.toLowerCase().includes(q) ||
        l.descriptionChambre.toLowerCase().includes(q) ||
        String(l.prix).includes(q),
    )
  }, [liste, query])

  const ouvrirCreation = useCallback(() => {
    setEditionId(null)
    setForm(VIDE)
    setMode("creation")
  }, [])

  const ouvrirEdition = useCallback((l: Logement) => {
    setEditionId(l.id)
    setForm({
      nom: l.nom,
      prix: l.prix,
      photosPresentation: [...l.photosPresentation] as [string, string],
      galeriePhotos: [...l.galeriePhotos],
      descriptionChambre: l.descriptionChambre,
    })
    setMode("edition")
  }, [])

  const fermerForm = useCallback(() => {
    setMode("ferme")
    setEditionId(null)
    setForm(VIDE)
  }, [])

  const handlePresentation = useCallback(
    async (index: 0 | 1, e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file?.type.startsWith("image/")) return
      const url = await fileVersDataUrl(file)
      setForm((prev) => {
        const next: [string, string] = [...prev.photosPresentation] as [string, string]
        next[index] = url
        return { ...prev, photosPresentation: next }
      })
      e.target.value = ""
    },
    [],
  )

  const handleGalerie = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (!f.type.startsWith("image/")) continue
      urls.push(await fileVersDataUrl(f))
    }
    if (urls.length) {
      setForm((prev) => ({ ...prev, galeriePhotos: [...prev.galeriePhotos, ...urls] }))
    }
    e.target.value = ""
  }, [])

  const retirerGalerie = useCallback((idx: number) => {
    setForm((prev) => ({
      ...prev,
      galeriePhotos: prev.galeriePhotos.filter((_, i) => i !== idx),
    }))
  }, [])

  const supprimer = useCallback((id: string) => {
    if (!window.confirm("Supprimer ce logement ?")) return
    setListe((prev) => prev.filter((x) => x.id !== id))
    if (editionId === id) fermerForm()
  }, [editionId, fermerForm])

  function soumettre(e: FormEvent) {
    e.preventDefault()
    const nom = form.nom.trim()
    if (!nom) return
    if (!form.photosPresentation[0] || !form.photosPresentation[1]) {
      window.alert("Ajoutez les deux photos de présentation.")
      return
    }

    if (mode === "creation") {
      const nouveau: Logement = {
        id: `log-${Date.now()}`,
        nom,
        prix: form.prix < 0 ? 0 : form.prix,
        photosPresentation: [form.photosPresentation[0], form.photosPresentation[1]],
        galeriePhotos: [...form.galeriePhotos],
        descriptionChambre: form.descriptionChambre.trim(),
      }
      setListe((prev) => [nouveau, ...prev])
    } else if (mode === "edition" && editionId) {
      setListe((prev) =>
        prev.map((x) =>
          x.id === editionId
            ? {
                ...x,
                nom,
                prix: form.prix < 0 ? 0 : form.prix,
                photosPresentation: [form.photosPresentation[0], form.photosPresentation[1]],
                galeriePhotos: [...form.galeriePhotos],
                descriptionChambre: form.descriptionChambre.trim(),
              }
            : x,
        ),
      )
    }
    fermerForm()
  }

  const formOuvert = mode !== "ferme"

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <h1 className={styles.title}>Logements</h1>
          {/* <IconPlusButton
            onClick={ouvrirCreation}
            aria-label="Nouveau logement"
            title="Nouveau logement"
          /> */}
        </div>
        <p className={styles.subtitle}>
          Gérez les fiches logements : deux photos de présentation, tarif, galerie et description de la chambre.
        </p>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.searchWrap}>
          <span className={styles.srOnly}>Rechercher</span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Rechercher par nom, prix, description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </label>
      </div>

      {formOuvert && (
        <form className={styles.formCard} onSubmit={soumettre} aria-labelledby={`${baseId}-form-title`}>
          <div className={styles.formHead}>
            <h2 id={`${baseId}-form-title`} className={styles.formTitle}>
              {mode === "creation" ? "Nouveau logement" : "Modifier le logement"}
            </h2>
            <button type="button" className={styles.btnGhost} onClick={fermerForm} aria-label="Fermer le formulaire">
              <X size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.label}>Nom du logement</span>
              <input
                className={styles.input}
                value={form.nom}
                onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                placeholder="Ex. Suite familiale"
                required
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Prix (€ / nuit)</span>
              <input
                className={styles.input}
                type="number"
                min={0}
                step={1}
                value={form.prix || ""}
                onChange={(e) => setForm((p) => ({ ...p, prix: Number(e.target.value) || 0 }))}
              />
            </label>
          </div>

          <div className={styles.block}>
            <span className={styles.label}>Photos de présentation (2)</span>
            <div className={styles.deuxPhotos}>
              {[0, 1].map((i) => (
                <label key={i} className={styles.presDrop}>
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={(e) => void handlePresentation(i as 0 | 1, e)}
                  />
                  {form.photosPresentation[i as 0 | 1] ? (
                    <>
                      <img
                        className={styles.presImg}
                        src={form.photosPresentation[i as 0 | 1]}
                        alt=""
                      />
                      <span className={styles.presOverlay}>Remplacer la photo</span>
                    </>
                  ) : (
                    <div className={styles.presPlaceholder}>
                      <ImagePlus size={28} strokeWidth={1.5} aria-hidden />
                      <span className={styles.presPlaceholderTitle}>Photo {i + 1}</span>
                      <span className={styles.presPlaceholderHint}>Cliquer pour importer</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.block}>
            <span className={styles.label}>Galerie du logement (critères / visuels)</span>
            <div className={styles.galerieRow}>
              {form.galeriePhotos.map((src, idx) => (
                <div key={`${src.slice(0, 32)}-${idx}`} className={styles.galerieItem}>
                  <img className={styles.galerieThumb} src={src} alt="" />
                  <button
                    type="button"
                    className={styles.galerieRemove}
                    onClick={() => retirerGalerie(idx)}
                    aria-label={`Retirer la photo ${idx + 1}`}
                  >
                    <X size={14} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              ))}
              <label className={styles.galerieAdd}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.fileInput}
                  onChange={(e) => void handleGalerie(e)}
                />
                <ImagePlus size={22} strokeWidth={2} aria-hidden />
                <span>Ajouter</span>
              </label>
            </div>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Description de la chambre</span>
            <textarea
              className={styles.textarea}
              rows={4}
              value={form.descriptionChambre}
              onChange={(e) => setForm((p) => ({ ...p, descriptionChambre: e.target.value }))}
              placeholder="Équipements, capacité, vue, etc."
            />
          </label>

          <div className={styles.formActions}>
            <button type="button" className={styles.btnSecondary} onClick={fermerForm}>
              Annuler
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {mode === "creation" ? "Enregistrer le logement" : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      )}

      {filtres.length === 0 ? (
        <div className={styles.empty}>
          <BedDouble size={40} strokeWidth={1.5} className={styles.emptyIcon} aria-hidden />
          <p className={styles.emptyText}>Aucun logement ne correspond à votre recherche.</p>
        </div>
      ) : (
        <ul className={styles.grid}>
          {filtres.map((l) => (
            <li key={l.id} className={styles.card}>
              <div className={styles.cardPhotos}>
                <img className={styles.cardPhotoMain} src={l.photosPresentation[0]} alt="" />
                <img className={styles.cardPhotoSec} src={l.photosPresentation[1]} alt="" />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{l.nom}</h3>
                <p className={styles.cardPrice}>
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(l.prix)}
                  <span className={styles.cardPriceHint}> / nuit</span>
                </p>
                <p className={styles.cardDesc}>{l.descriptionChambre || "—"}</p>
                {l.galeriePhotos.length > 0 && (
                  <div className={styles.cardGalerie}>
                    {l.galeriePhotos.slice(0, 4).map((src, i) => (
                      <img key={`${l.id}-g-${i}`} className={styles.cardGalerieThumb} src={src} alt="" />
                    ))}
                    {l.galeriePhotos.length > 4 && (
                      <span className={styles.cardGalerieMore}>+{l.galeriePhotos.length - 4}</span>
                    )}
                  </div>
                )}
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.cardAction}
                    onClick={() => ouvrirEdition(l)}
                  >
                    <Pencil size={15} strokeWidth={2} aria-hidden />
                    Modifier
                  </button>
                  <span className={styles.cardActionSep} aria-hidden>
                    ·
                  </span>
                  <button
                    type="button"
                    className={styles.cardActionDanger}
                    onClick={() => supprimer(l.id)}
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden />
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

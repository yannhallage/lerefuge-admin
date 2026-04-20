import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import {
  BedDouble,
  ChevronRight,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { CreateLogementForm, type Logement } from "./createLogement"
import { libellesCriteres } from "./logementCriteres"
import { loadLogements, saveLogements } from "./logementStorage"
import styles from "./LogementsPage.module.css"

export type { Logement } from "./createLogement"

type ModeListe = "ferme" | "edition"

export function LogementsPage() {
  const baseId = useId()
  const searchId = useId()
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [liste, setListe] = useState<Logement[]>(loadLogements)
  const [mode, setMode] = useState<ModeListe>("ferme")
  const [editionId, setEditionId] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    saveLogements(liste)
  }, [liste])

  const filtres = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return liste
    return liste.filter((l) => {
      const criteresTexte = libellesCriteres(l.criteresIds).join(" ").toLowerCase()
      return (
        l.nom.toLowerCase().includes(q) ||
        l.descriptionChambre.toLowerCase().includes(q) ||
        String(l.prix).includes(q) ||
        criteresTexte.includes(q)
      )
    })
  }, [liste, query])

  const logementEdition = useMemo(
    () => (editionId ? liste.find((l) => l.id === editionId) ?? null : null),
    [liste, editionId],
  )

  const ouvrirEdition = useCallback((l: Logement) => {
    setEditionId(l.id)
    setMode("edition")
  }, [])

  const fermerForm = useCallback(() => {
    setMode("ferme")
    setEditionId(null)
  }, [])

  useEffect(() => {
    if (mode === "edition" && editionId && !liste.some((l) => l.id === editionId)) {
      fermerForm()
    }
  }, [mode, editionId, liste, fermerForm])

  const supprimer = useCallback(
    (id: string) => {
      if (!window.confirm("Supprimer ce logement ?")) return
      setListe((prev) => prev.filter((x) => x.id !== id))
      if (editionId === id) fermerForm()
    },
    [editionId, fermerForm],
  )

  const editionOuverte = mode === "edition" && logementEdition !== null

  const formatPrix = useCallback((prix: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(prix)
  }, [])

  const totalListe = liste.length
  const totalFiltres = filtres.length
  const rechercheActive = query.trim().length > 0

  return (
    <div className={styles.wrap}>
      <section className={styles.intro} aria-labelledby={`${baseId}-intro-title`}>
        <h2 id={`${baseId}-intro-title`} className={styles.introTitle}>
          Logements
        </h2>
        <p className={styles.introText}>
          Centralisez les fiches affichées côté site : deux photos de présentation, tarif à la nuit, galerie
          « critères » et texte descriptif. Les modifications sont enregistrées dans ce navigateur.
        </p>
      </section>

      <div className={styles.breadcrumbRow}>
        <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
          <span className={styles.breadcrumbMuted}>Contenu</span>
          <span className={styles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <span>Logements</span>
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
                className={styles.queryInput}
                placeholder="Nom du logement, extrait de description, montant…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </label>
          </div>
          <div className={styles.addWrap}>
            <button type="button" className={styles.uploadButton} onClick={() => navigate("/logements/nouveau")}>
              <Plus size={17} strokeWidth={2} aria-hidden />
              Nouveau logement
            </button>
          </div>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <p className={styles.summaryText}>
          <span className={styles.summaryLead}>
            <strong>{totalFiltres}</strong>{" "}
            {totalFiltres === 1 ? "fiche affichée" : "fiches affichées"}
          </span>
          <span className={styles.summarySub}>
            {" "}
            · catalogue : <strong>{totalListe}</strong>{" "}
            {totalListe === 1 ? "logement" : "logements"}
            {rechercheActive ? (
              <>
                {" "}
                · filtre actif sur « <span className={styles.summaryQuery}>{query.trim()}</span> »
              </>
            ) : null}
          </span>
        </p>
      </div>

      {editionOuverte && logementEdition && (
        <CreateLogementForm
          mode="edition"
          logementEdition={logementEdition}
          onCancel={fermerForm}
          onSaved={(logement) => {
            setListe((prev) => prev.map((x) => (x.id === logement.id ? logement : x)))
            fermerForm()
          }}
        />
      )}

      {filtres.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            <BedDouble size={36} strokeWidth={1.5} className={styles.emptyIcon} aria-hidden />
            <p className={styles.emptyTitle}>
              {rechercheActive ? "Aucun résultat" : "Aucun logement"}
            </p>
            <p className={styles.emptyText}>
              {rechercheActive
                ? "Modifiez ou effacez votre recherche, ou créez une nouvelle fiche depuis le bouton ci-dessus."
                : "Créez votre première fiche logement pour alimenter le catalogue."}
            </p>
            {rechercheActive ? (
              <button type="button" className={styles.emptyAction} onClick={() => setQuery("")}>
                Réinitialiser la recherche
              </button>
            ) : (
              <button type="button" className={styles.uploadButton} onClick={() => navigate("/logements/nouveau")}>
                <Plus size={17} strokeWidth={2} aria-hidden />
                Nouveau logement
              </button>
            )}
          </div>
        </div>
      ) : (
        <ul className={styles.grid} aria-label="Catalogue des logements">
          {filtres.map((l) => {
            const critères = l.criteresIds.length
            const badgeTarif =
              l.prix > 0 ? `À partir de ${formatPrix(l.prix)}` : "Tarif à définir"
            return (
              <li key={l.id} className={styles.card}>
                <div className={styles.cardMedia}>
                  <img
                    className={styles.cardHero}
                    src={l.photosPresentation[0]}
                    alt={`Photo principale — ${l.nom}`}
                  />
                  <span className={styles.cardBadge} aria-hidden>
                    {badgeTarif}
                  </span>
                  <button
                    type="button"
                    className={styles.cardDeleteFab}
                    onClick={() => supprimer(l.id)}
                    aria-label={`Supprimer ${l.nom}`}
                    title="Supprimer"
                  >
                    <Trash2 size={16} strokeWidth={2} aria-hidden />
                  </button>
                  <div className={styles.cardMediaBar} aria-hidden>
                    <span className={styles.cardMediaStat}>
                      <Users size={15} strokeWidth={2} aria-hidden />
                      2 vues
                    </span>
                    <span className={styles.cardMediaStat}>
                      <LayoutGrid size={15} strokeWidth={2} aria-hidden />
                      {critères === 0
                        ? "Aucun critère"
                        : critères === 1
                          ? "1 critère"
                          : `${critères} critères`}
                    </span>
                  </div>
                </div>
                <div className={styles.cardPanel}>
                  <h3 className={styles.cardTitleLux}>{l.nom}</h3>
                  <p className={styles.cardDescLux}>
                    {l.descriptionChambre || "Aucune description pour ce logement."}
                  </p>
                  <button
                    type="button"
                    className={styles.cardCta}
                    onClick={() => ouvrirEdition(l)}
                  >
                    <span className={styles.cardCtaLabel}>
                      <Pencil size={14} strokeWidth={2} aria-hidden className={styles.cardCtaIcon} />
                      {l.prix > 0 ? (
                        <>
                          Modifier pour {formatPrix(l.prix)}
                          <span className={styles.cardCtaPer}> / nuit</span>
                        </>
                      ) : (
                        <>Modifier la fiche</>
                      )}
                    </span>
                    <ChevronRight size={16} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        className={styles.fab}
        onClick={() => navigate("/logements/nouveau")}
        aria-label="Nouveau logement"
      >
        <Plus size={16} strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  )
}

import { useCallback, useId, useMemo, useRef, useState } from "react"
import {
  BedDouble,
  ChevronRight,
  Eye,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { libellesCriteres } from "./logementCriteres"
import styles from "./LogementsPage.module.css"
import {
  useDeleteLogement,
  useLogementList,
} from "@/features/logement/hooks/useLogement"
import type { LogementItem } from "@/features/logement/api/logement.types"
import { logementApi } from "@/features/logement/api/logement.api"
import { useToast } from "@/app/components/ToastProvider"
type LogementCard = {
  id: string
  nom: string
  prix: number
  descriptionChambre: string
  criteresIds: string[]
  photosPresentation: [string, string]
}

export function LogementsPage() {
  const baseId = useId()
  const searchId = useId()
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { data, isLoading, error } = useLogementList()
  const deleteLogement = useDeleteLogement()
  const toast = useToast()
  const [query, setQuery] = useState("")
  const liste = useMemo<LogementCard[]>(
    () =>
      (data ?? []).map((item: LogementItem) => ({
        id: item.logement_id,
        nom: item.nom_logement,
        prix: item.prix ?? 0,
        descriptionChambre: item.description ?? "",
        criteresIds: item.specification ?? [],
        photosPresentation: [
          item.image?.[0] ?? "https://placehold.co/800x600?text=Logement",
          item.image?.[1] ?? item.image?.[0] ?? "https://placehold.co/800x600?text=Logement",
        ],
      })),
    [data],
  )

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

  const supprimer = useCallback(async (id: string) => {
    if (!window.confirm("Supprimer ce logement ?")) return
    try {
      await deleteLogement.mutateAsync(id)
      toast.success({
        title: "Logement supprime",
        description: "Le logement a ete supprime avec succes.",
      })
    } catch {
      toast.error({
        title: "Suppression impossible",
        description: "Le logement n'a pas pu etre supprime.",
      })
    }
  }, [deleteLogement, toast])

  const formatPrix = useCallback((prix: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(prix)
  }, [])

  const voirDetails = useCallback(async (id: string) => {
    try {
      const logement = await logementApi.getOne(id)
      if (!logement) {
        toast.error({
          title: "Logement introuvable",
          description: "Impossible de charger la fiche demandee.",
        })
        return
      }
      navigate(`/logements/${id}`)
    } catch {
      toast.error({
        title: "Chargement impossible",
        description: "La fiche detaillee n'a pas pu etre chargee.",
      })
    }
  }, [navigate, toast])

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
          « critères » et texte descriptif. Les modifications sont enregistrées sur l’API.
        </p>
      </section>
      {error ? <p className={styles.empty}>Impossible de charger les logements.</p> : null}

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
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => navigate("/logements/nouveau")}
            >
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

      {isLoading ? <p className={styles.empty}>Chargement des logements...</p> : null}
      {!isLoading && filtres.length === 0 ? (
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
              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => navigate("/logements/nouveau")}
              >
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
                    onClick={() => void voirDetails(l.id)}
                  >
                    <span className={styles.cardCtaLabel}>
                      <Eye size={14} strokeWidth={2} aria-hidden className={styles.cardCtaIcon} />
                      Voir les détails
                      {l.prix > 0 ? <span className={styles.cardCtaPer}> · {formatPrix(l.prix)} / nuit</span> : null}
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

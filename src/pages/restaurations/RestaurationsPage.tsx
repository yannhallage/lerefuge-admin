import { useCallback, useId, useMemo, useRef, useState } from "react"
import { Eye, LayoutGrid, Plus, Search, UtensilsCrossed, Users, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { BeatLoader } from "react-spinners"
import { useDeleteRestauration, useRestaurationList } from "@/features/restauration/hooks/useRestauration"
import { useToast } from "@/app/components/ToastProvider"
import type { Repas, StatutRepas } from "./repasTypes"
import styles from "./RestaurationsPage.module.css"

const FORMAT_PRIX = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
})

const LIBELLES_STATUT: Record<StatutRepas, string> = {
  disponible: "Disponible",
  rupture: "Rupture",
  masque: "Masque",
}

function classeStatut(statut: StatutRepas) {
  if (statut === "rupture") return styles.badgeRupture
  if (statut === "masque") return styles.badgeMasque
  return styles.badgeDisponible
}

export function RestaurationsPage() {
  const searchId = useId()
  const navigate = useNavigate()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { data, isLoading, error } = useRestaurationList()
  const deleteRestauration = useDeleteRestauration()
  const toast = useToast()
  const [query, setQuery] = useState("")

  const repas = useMemo<Repas[]>(
    () =>
      (data ?? []).map((item, index) => ({
        id: item.resto_id ?? item.id ?? `resto-${index}`,
        nom: item.nom?.trim() || "Repas sans nom",
        categorie: "Plat principal",
        prix: typeof item.prix === "number" ? item.prix : Number(item.prix ?? 0),
        description: item.description?.trim() || "Aucune description",
        statut: "disponible" as StatutRepas,
        image: item.image?.trim() || null,
      })),
    [data],
  )

  const repasFiltres = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return repas
    return repas.filter((item) => {
      const bloc = [item.nom, item.categorie, item.description, LIBELLES_STATUT[item.statut]].join(" ").toLowerCase()
      return bloc.includes(q)
    })
  }, [repas, query])

  const rechercheActive = query.trim().length > 0
  const suppressionEnCours = deleteRestauration.isPending
  const supprimerProduit = useCallback(
    async (id: string, nom: string) => {
      if (!window.confirm(`Supprimer le produit "${nom}" ?`)) return
      try {
        await deleteRestauration.mutateAsync(id)
        toast.success({
          title: "Repas supprime",
          description: `Le repas "${nom}" a ete retire avec succes.`,
        })
      } catch {
        toast.error({
          title: "Suppression impossible",
          description: `Le repas "${nom}" n'a pas pu etre supprime.`,
        })
      }
    },
    [deleteRestauration, toast],
  )

  return (
    <div className={styles.wrap}>
      <section className={styles.intro}>
        <h2 className={styles.introTitle}>Carte restaurant</h2>
        <p className={styles.introText}>
          Cette page affiche les repas du restaurant depuis l API.
        </p>
      </section>

      <div className={styles.breadcrumbRow}>
        <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
          <span className={styles.breadcrumbMuted}>Pages vitrine</span>
          <span className={styles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <span>Carte restaurant</span>
        </nav>
        <button
          type="button"
          className={styles.quickSearchBtn}
          aria-label="Aller a la recherche"
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
                placeholder="Nom du repas, categorie, description, statut..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  className={styles.clearQueryBtn}
                  onClick={() => {
                    setQuery("")
                    searchInputRef.current?.focus()
                  }}
                  aria-label="Effacer la recherche"
                >
                  <X size={14} strokeWidth={2.2} aria-hidden />
                </button>
              ) : null}
            </label>
          </div>
          <div className={styles.addWrap}>
            <button type="button" className={styles.uploadButton} onClick={() => navigate("/carte/nouveau")}>
              <Plus size={17} strokeWidth={2} aria-hidden />
              Nouveau repas
            </button>
          </div>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <p className={styles.summaryText}>
          <strong>{repasFiltres.length}</strong> {repasFiltres.length === 1 ? "repas affiche" : "repas affiches"}
          <span className={styles.summarySub}>
            {" "}
            · total : <strong>{repas.length}</strong> {repas.length === 1 ? "repas" : "repas"}
          </span>
        </p>
      </div>
      {isLoading ? <p className={styles.emptyText}>Chargement des repas...</p> : null}
      {error ? <p className={styles.emptyText}>Impossible de charger les repas.</p> : null}

      {repasFiltres.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            <UtensilsCrossed size={36} strokeWidth={1.5} className={styles.emptyIcon} aria-hidden />
            <p className={styles.emptyTitle}>{rechercheActive ? "Aucun resultat" : "Aucun repas"}</p>
            <p className={styles.emptyText}>
              {rechercheActive
                ? "Modifiez ou effacez votre recherche pour voir les repas disponibles."
                : "Les repas apparaitront ici apres chargement depuis votre source de donnees."}
            </p>
            {rechercheActive ? (
              <button type="button" className={styles.emptyAction} onClick={() => setQuery("")}>
                Reinitialiser la recherche
              </button>
            ) : (
              <button type="button" className={styles.uploadButton} onClick={() => navigate("/carte/nouveau")}>
                <Plus size={17} strokeWidth={2} aria-hidden />
                Nouveau repas
              </button>
            )}
          </div>
        </div>
      ) : (
        <ul className={styles.grid} aria-label="Liste des repas">
          {repasFiltres.map((item) => (
            <li key={item.id} className={styles.card}>
              <div className={styles.cardMedia}>
                <div className={styles.cardHero} aria-hidden>
                  {item.image ? (
                    <img src={item.image} alt={`Photo de ${item.nom}`} className={styles.cardHeroImage} />
                  ) : (
                    <UtensilsCrossed size={30} strokeWidth={1.75} />
                  )}
                </div>
                <span className={styles.cardBadge} aria-hidden>
                  {FORMAT_PRIX.format(item.prix)}
                </span>
                <div className={styles.cardMediaBar} aria-hidden>
                  <span className={styles.cardMediaStat}>
                    <Users size={15} strokeWidth={2} aria-hidden />
                    Cuisine
                  </span>
                  <span className={styles.cardMediaStat}>
                    <LayoutGrid size={15} strokeWidth={2} aria-hidden />
                    {item.categorie}
                  </span>
                </div>
              </div>
              <div className={styles.cardPanel}>
                <h3 className={styles.cardTitleLux}>{item.nom}</h3>
                <p className={styles.cardDescLux}>{item.description}</p>
                <div className={styles.cardMetaRow}>
                  <span className={styles.cardMetaLabel}>Statut</span>
                  <span className={[styles.badge, classeStatut(item.statut)].join(" ")}>
                    {LIBELLES_STATUT[item.statut]}
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <button type="button" className={styles.cardCta}>
                    <span className={styles.cardCtaLabel}>
                      <Eye size={14} strokeWidth={2} aria-hidden className={styles.cardCtaIcon} />
                      Voir
                    </span>
                    {/* <ChevronRight size={16} strokeWidth={2} aria-hidden /> */}
                  </button>
                  <button
                    type="button"
                    className={styles.cardDeleteButton}
                    onClick={() => supprimerProduit(item.id, item.nom)}
                    disabled={suppressionEnCours}
                    aria-label={`Supprimer ${item.nom}`}
                    title={`Supprimer ${item.nom}`}
                  >
                    {/* <Trash2 size={14} strokeWidth={2} aria-hidden /> */}
                    {suppressionEnCours ?  <BeatLoader size={8} color="#fff" aria-hidden /> : "Supprimer"}
                    </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className={styles.fab} onClick={() => navigate("/carte/nouveau")} aria-label="Nouveau repas">
        <Plus size={16} strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  )
}

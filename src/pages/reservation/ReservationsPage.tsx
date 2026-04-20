import { useEffect, useId, useMemo, useRef, useState } from "react"
import { CalendarCheck2, Search } from "lucide-react"
import type { Reservation, StatutReservation } from "./reservationTypes"
import { loadReservations, saveReservations } from "./reservationStorage"
import styles from "./ReservationsPage.module.css"

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

function formatDateIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  return dateFmt.format(new Date(y, m - 1, d))
}

const LIBELLES_STATUT: Record<StatutReservation, string> = {
  "en-attente": "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
}

function classeStatut(s: StatutReservation) {
  if (s === "confirmee") return styles.statutConfirmee
  if (s === "annulee") return styles.statutAnnulee
  return styles.statutEnAttente
}

export function ReservationsPage() {
  const baseId = useId()
  const searchId = useId()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [liste] = useState<Reservation[]>(loadReservations)
  const [query, setQuery] = useState("")

  useEffect(() => {
    saveReservations(liste)
  }, [liste])

  const filtres = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return liste
    return liste.filter((r) => {
      const bloc = [
        // r.id,
        r.nomClient,
        // r.email,
        r.telephone,
        // r.typeChambre,
        // r.message,
        LIBELLES_STATUT[r.statut],
        formatDateIso(r.dateArrivee),
        formatDateIso(r.dateDepart),
        r.dateArrivee,
        r.dateDepart,
      ]
        .join(" ")
        .toLowerCase()
      return bloc.includes(q)
    })
  }, [liste, query])

  const totalListe = liste.length
  const totalFiltres = filtres.length
  const rechercheActive = query.trim().length > 0

  return (
    <div className={styles.wrap}>
      <section className={styles.intro} aria-labelledby={`${baseId}-intro-title`}>
        <h2 id={`${baseId}-intro-title`} className={styles.introTitle}>
          Réservations
        </h2>
        <p className={styles.introText}>
          Demandes issues du formulaire site (dates, composition du séjour, type de chambre, coordonnées et
          message). Les lignes d’exemple sont stockées dans ce navigateur jusqu’à branchement sur votre API.
        </p>
      </section>

      <div className={styles.breadcrumbRow}>
        <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
          <span className={styles.breadcrumbMuted}>Contenu</span>
          <span className={styles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <span>Réservations</span>
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
                placeholder="Nom, e-mail, téléphone, type de chambre, dates, statut…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </label>
          </div>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <p className={styles.summaryText}>
          <span className={styles.summaryLead}>
            <strong>{totalFiltres}</strong>{" "}
            {totalFiltres === 1 ? "ligne affichée" : "lignes affichées"}
          </span>
          <span className={styles.summarySub}>
            {" "}
            · total : <strong>{totalListe}</strong>{" "}
            {totalListe === 1 ? "réservation" : "réservations"}
            {rechercheActive ? (
              <>
                {" "}
                · filtre « <span className={styles.summaryQuery}>{query.trim()}</span> »
              </>
            ) : null}
          </span>
        </p>
      </div>

      {filtres.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            <CalendarCheck2 size={36} strokeWidth={1.5} className={styles.emptyIcon} aria-hidden />
            <p className={styles.emptyTitle}>
              {rechercheActive ? "Aucun résultat" : "Aucune réservation"}
            </p>
            <p className={styles.emptyText}>
              {rechercheActive
                ? "Modifiez ou effacez votre recherche pour voir plus de lignes."
                : "Les demandes du formulaire apparaîtront ici une fois connectées à la source de données."}
            </p>
            {rechercheActive ? (
              <button type="button" className={styles.emptyAction} onClick={() => setQuery("")}>
                Réinitialiser la recherche
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {/* <th scope="col">ID</th> */}
                  <th scope="col">Arrivée</th>
                  <th scope="col">Départ</th>
                  {/* <th scope="col">Adultes</th>
                  <th scope="col">Enfants</th>
                  <th scope="col">Chambres</th> */}
                  <th scope="col">Type de chambre</th>
                  <th scope="col">Nom</th>
                  {/* <th scope="col">E-mail</th> */}
                  <th scope="col">Téléphone</th>
                  {/* <th scope="col">Message</th> */}
                  <th scope="col">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtres.map((r) => (
                  <tr key={r.dateArrivee + r.dateDepart + r.nomClient + r.email + r.telephone + r.typeChambre + r.message + r.statut}>
                    {/* <td className={styles.cellMuted}>{r.id}</td> */}
                    <td>{formatDateIso(r.dateArrivee)}</td>
                    <td>{formatDateIso(r.dateDepart)}</td>
                    {/* <td className={styles.cellMuted}>{r.adultes}</td>
                    <td className={styles.cellMuted}>{r.enfants}</td>
                    <td className={styles.cellMuted}>{r.nombreChambres}</td> */}
                    <td>{r.typeChambre}</td>
                    <td>{r.nomClient}</td>
                    {/* <td>
                      <a href={`mailto:${r.email}`}>{r.email}</a>
                    </td> */}
                    <td>
                      {r.telephone}
                    </td>
                    {/* <td>
                      {r.message ? (
                        <span className={styles.cellEllipsis} title={r.message}>
                          {r.message}
                        </span>
                      ) : (
                        <span className={styles.cellMuted}>—</span>
                      )}
                    </td> */}
                    <td>
                      <span className={`${styles.statutBadge} ${classeStatut(r.statut)}`}>
                        {LIBELLES_STATUT[r.statut]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

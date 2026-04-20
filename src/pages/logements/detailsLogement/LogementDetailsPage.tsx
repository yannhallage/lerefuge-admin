import { useMemo, useState } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { CreateLogementForm, type Logement } from "../createLogement"
import { libellesCriteres } from "../logementCriteres"
import { loadLogements, saveLogements } from "../logementStorage"
import listStyles from "../LogementsPage.module.css"
import pageStyles from "./LogementDetailsPage.module.css"

export function LogementDetailsPage() {
  const { logementId } = useParams<{ logementId: string }>()
  const navigate = useNavigate()
  const [editionActive, setEditionActive] = useState(false)
  const [version, setVersion] = useState(0)

  const logement = useMemo<Logement | null>(() => {
    if (!logementId) return null
    return loadLogements().find((item) => item.id === logementId) ?? null
  }, [logementId, version])

  if (!logementId || !logement) {
    return <Navigate to="/logements" replace />
  }

  const criteres = libellesCriteres(logement.criteresIds)

  return (
    <div className={listStyles.wrap}>
      <section className={listStyles.intro}>
        <h2 className={listStyles.introTitle}>Détail logement</h2>
        <p className={listStyles.introText}>
          Fiche complète du logement sélectionné. Vous pouvez modifier les informations sans afficher le formulaire dans
          la liste.
        </p>
      </section>

      <div className={listStyles.breadcrumbRow}>
        <nav className={listStyles.breadcrumb} aria-label="Fil d’Ariane">
          <span className={listStyles.breadcrumbMuted}>Contenu</span>
          <span className={listStyles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <Link to="/logements" className={listStyles.breadcrumbLink}>
            Logements
          </Link>
          <span className={listStyles.breadcrumbSep} aria-hidden>
            &gt;
          </span>
          <span>{logement.nom}</span>
        </nav>
      </div>

      <div className={pageStyles.topRow}>
        <Link to="/logements" className={pageStyles.back}>
          <ArrowLeft size={18} strokeWidth={2} aria-hidden />
          Retour au catalogue
        </Link>
        <div className={pageStyles.actions}>
          <button type="button" className={pageStyles.editBtn} onClick={() => setEditionActive((v) => !v)}>
            <Pencil size={16} strokeWidth={2} aria-hidden />
            {editionActive ? "Masquer l’édition" : "Modifier la fiche"}
          </button>
          <button
            type="button"
            className={pageStyles.deleteBtn}
            onClick={() => {
              if (!window.confirm("Supprimer ce logement ?")) return
              const restants = loadLogements().filter((item) => item.id !== logement.id)
              saveLogements(restants)
              navigate("/logements", { replace: true })
            }}
          >
            <Trash2 size={16} strokeWidth={2} aria-hidden />
            Supprimer
          </button>
        </div>
      </div>

      <section className={pageStyles.card}>
        <img className={pageStyles.hero} src={logement.photosPresentation[0]} alt={`Photo principale — ${logement.nom}`} />
        <div className={pageStyles.content}>
          <p className={pageStyles.price}>
            {logement.prix > 0
              ? new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(logement.prix)
              : "Tarif à définir"}
            {logement.prix > 0 ? " / nuit" : ""}
          </p>
          <h3 className={pageStyles.title}>{logement.nom}</h3>
          <p className={pageStyles.description}>
            {logement.descriptionChambre || "Aucune description pour ce logement."}
          </p>

          {criteres.length > 0 ? (
            <ul className={pageStyles.criteres}>
              {criteres.map((critere) => (
                <li key={critere} className={pageStyles.critere}>
                  {critere}
                </li>
              ))}
            </ul>
          ) : (
            <p className={pageStyles.noCritere}>Aucun critère sélectionné.</p>
          )}

          <div className={pageStyles.gallery}>
            {logement.photosPresentation[1] ? (
              <img className={pageStyles.galleryItem} src={logement.photosPresentation[1]} alt={`Photo secondaire — ${logement.nom}`} />
            ) : null}
            {logement.galeriePhotos.map((src, idx) => (
              <img key={`${src.slice(0, 24)}-${idx}`} className={pageStyles.galleryItem} src={src} alt={`Galerie ${idx + 1} — ${logement.nom}`} />
            ))}
          </div>
        </div>
      </section>

      {editionActive ? (
        <CreateLogementForm
          presentation="page"
          mode="edition"
          logementEdition={logement}
          onCancel={() => setEditionActive(false)}
          onSaved={(next) => {
            const actuels = loadLogements()
            saveLogements(actuels.map((item) => (item.id === next.id ? next : item)))
            setVersion((v) => v + 1)
            setEditionActive(false)
          }}
        />
      ) : null}
    </div>
  )
}

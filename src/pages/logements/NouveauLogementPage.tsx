import { useId } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { CreateLogementForm } from "./createLogement"
import { loadLogements, saveLogements } from "./logementStorage"
import listStyles from "./LogementsPage.module.css"
import pageStyles from "./NouveauLogementPage.module.css"

export function NouveauLogementPage() {
  const baseId = useId()
  const navigate = useNavigate()

  return (
    <div className={listStyles.wrap}>
      <section className={listStyles.intro} aria-labelledby={`${baseId}-title`}>
        <h2 id={`${baseId}-title`} className={listStyles.introTitle}>
          Nouveau logement
        </h2>
        <p className={listStyles.introText}>
          Même principe que la liste des logements : fiche sur toute la largeur utile, enregistrement local dans le
          navigateur, puis retour au catalogue.
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
          <span>Nouveau</span>
        </nav>
      </div>

      <div className={pageStyles.topRow}>
        <Link to="/logements" className={pageStyles.back}>
          <ArrowLeft size={18} strokeWidth={2} aria-hidden />
          Retour au catalogue
        </Link>
        <p className={pageStyles.meta}>Les champs obligatoires sont le nom et les deux photos de présentation.</p>
      </div>

      <CreateLogementForm
        presentation="page"
        mode="creation"
        logementEdition={null}
        onCancel={() => navigate("/logements")}
        onSaved={(logement) => {
          const actuels = loadLogements()
          saveLogements([logement, ...actuels])
          navigate("/logements")
        }}
      />
    </div>
  )
}

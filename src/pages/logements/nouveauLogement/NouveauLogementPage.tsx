import { useId } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { CreateLogementForm, toCreateLogementInput } from "../createLogement"
import listStyles from "../LogementsPage.module.css"
import pageStyles from "./NouveauLogementPage.module.css"
import { useCreateLogement } from "@/features/logement/hooks/useLogement"
import { useToast } from "@/app/components/ToastProvider"
import type { Logement } from "../createLogement"

export function NouveauLogementPage() {
  const baseId = useId()
  const navigate = useNavigate()
  const createLogement = useCreateLogement()
  const toast = useToast()

  return (
    <div className={listStyles.wrap}>
      <section className={listStyles.intro} aria-labelledby={`${baseId}-title`}>
        <h2 id={`${baseId}-title`} className={listStyles.introTitle}>
          Nouveau logement
        </h2>
        <p className={listStyles.introText}>
          Création d’un logement branchée sur l’API. Les données et les images sont enregistrées côté serveur.
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
        isSubmitting={createLogement.isPending}
        onCancel={() => navigate("/logements")}
        onSaved={(logement: Logement) => {
          const run = async () => {
            const payload = await toCreateLogementInput(logement)
            await createLogement.mutateAsync(payload)
            toast.success({
              title: "Logement cree",
              description: `Le logement "${logement.nom}" a ete enregistre.`,
            })
            navigate("/logements")
          }

          run().catch(() => {
            toast.error({
              title: "Creation impossible",
              description: "La creation du logement a echoue.",
            })
          })
        }}
      />
    </div>
  )
}

import { useId } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { CreateLogementForm } from "../createLogement"
import { libellesCriteres } from "../logementCriteres"
import listStyles from "../LogementsPage.module.css"
import pageStyles from "./NouveauLogementPage.module.css"
import { useCreateLogement } from "@/features/logement/hooks/useLogement"
import { useToast } from "@/app/components/ToastProvider"
import type { Logement } from "../createLogement"

async function dataUrlToFile(dataUrl: string, fallbackName: string): Promise<File> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const ext = blob.type.split("/")[1] ?? "jpg"
  return new File([blob], `${fallbackName}.${ext}`, { type: blob.type || "image/jpeg" })
}

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
        onCancel={() => navigate("/logements")}
        onSaved={(logement: Logement) => {
          const run = async () => {
            const photos = await Promise.all(
              logement.photosPresentation.map((src, idx) => dataUrlToFile(src, `presentation-${idx + 1}`)),
            )
            const galerie = await Promise.all(
              logement.galeriePhotos.map((src, idx) => dataUrlToFile(src, `galerie-${idx + 1}`)),
            )
            const specification = libellesCriteres(logement.criteresIds)
            await createLogement.mutateAsync({
              nom_logement: logement.nom,
              prix: logement.prix,
              aire_chambre: logement.aireChambre,
              nbre_personne: logement.nbrePersonne,
              specification: specification.length > 0 ? specification : ["Standard"],
              images: [...photos, ...galerie],
            })
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

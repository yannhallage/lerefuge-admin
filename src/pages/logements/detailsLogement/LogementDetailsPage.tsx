import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { CreateLogementForm, toCreateLogementInput, type Logement } from "../createLogement"
import { libellesCriteres } from "../logementCriteres"
import { logementApi } from "@/features/logement/api/logement.api"
import { useDeleteLogement, useUpdateLogement } from "@/features/logement/hooks/useLogement"
import { useToast } from "@/app/components/ToastProvider"
import listStyles from "../LogementsPage.module.css"
import pageStyles from "./LogementDetailsPage.module.css"

export function LogementDetailsPage() {
  const { logementId } = useParams<{ logementId: string }>()
  const navigate = useNavigate()
  const [editionActive, setEditionActive] = useState(false)
  const updateLogement = useUpdateLogement()
  const deleteLogement = useDeleteLogement()
  const toast = useToast()
  const placeholderImage = "https://placehold.co/800x600?text=Logement"

  const { data: logementApiData, isLoading, isError } = useQuery({
    queryKey: ["logement", "details", logementId],
    queryFn: async () => {
      if (!logementId) return null
      return logementApi.getOne(logementId)
    },
    enabled: Boolean(logementId),
  })

  const logement = useMemo<Logement | null>(() => {
    if (!logementApiData) return null
    return {
      id: logementApiData.logement_id,
      nom: logementApiData.nom_logement,
      prix: logementApiData.prix ?? 0,
      aireChambre: logementApiData.aire_chambre ?? 0,
      nbrePersonne: logementApiData.nbre_personne ?? undefined,
      photosPresentation: [
        logementApiData.image?.[0] ?? placeholderImage,
        logementApiData.image?.[1] ?? logementApiData.image?.[0] ?? placeholderImage,
      ],
      galeriePhotos: logementApiData.image?.slice(2) ?? [],
      descriptionChambre: logementApiData.description ?? "",
      criteresIds: logementApiData.specification ?? [],
    }
  }, [logementApiData])

  if (!logementId) {
    return <p className={listStyles.empty}>Identifiant de logement manquant.</p>
  }

  if (isLoading) {
    return <p className={listStyles.empty}>Chargement du logement...</p>
  }

  if (isError || !logement) {
    return (
      <div className={listStyles.wrap}>
        <p className={listStyles.empty}>Impossible de charger ce logement.</p>
        <div className={pageStyles.topRow}>
          <Link to="/logements" className={pageStyles.back}>
            <ArrowLeft size={18} strokeWidth={2} aria-hidden />
            Retour au catalogue
          </Link>
        </div>
      </div>
    )
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
              const run = async () => {
                await deleteLogement.mutateAsync(logement.id)
                toast.success({
                  title: "Logement supprime",
                  description: "Le logement a bien ete supprime.",
                })
                navigate("/logements", { replace: true })
              }
              run().catch(() => {
                toast.error({
                  title: "Suppression impossible",
                  description: "Le logement n'a pas pu etre supprime.",
                })
              })
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
          isSubmitting={updateLogement.isPending}
          onCancel={() => setEditionActive(false)}
          onSaved={(next) => {
            const run = async () => {
              const payload = await toCreateLogementInput(next)
              await updateLogement.mutateAsync({ id: next.id, payload })
              toast.success({
                title: "Logement mis a jour",
                description: "Les modifications ont ete enregistrees.",
              })
              setEditionActive(false)
            }
            run().catch(() => {
              toast.error({
                title: "Mise a jour impossible",
                description: "Les modifications n'ont pas pu etre enregistrees.",
              })
            })
          }}
        />
      ) : null}
    </div>
  )
}

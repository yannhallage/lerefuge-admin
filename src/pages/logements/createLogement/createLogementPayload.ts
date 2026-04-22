import type { CreateLogementInput } from "@/features/logement/api/logement.types"
import { libellesCriteres } from "../logementCriteres"
import type { Logement } from "./logementTypes"

async function dataUrlToFile(dataUrl: string, fallbackName: string): Promise<File> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const ext = blob.type.split("/")[1] ?? "jpg"
  return new File([blob], `${fallbackName}.${ext}`, { type: blob.type || "image/jpeg" })
}

export async function toCreateLogementInput(logement: Logement): Promise<CreateLogementInput> {
  const photos = await Promise.all(
    logement.photosPresentation.map((src, idx) => dataUrlToFile(src, `presentation-${idx + 1}`)),
  )
  const galerie = await Promise.all(
    logement.galeriePhotos.map((src, idx) => dataUrlToFile(src, `galerie-${idx + 1}`)),
  )
  const specification = libellesCriteres(logement.criteresIds)

  return {
    nom_logement: logement.nom,
    prix: logement.prix,
    aire_chambre: logement.aireChambre,
    nbre_personne: logement.nbrePersonne,
    specification: specification.length > 0 ? specification : ["Standard"],
    images: [...photos, ...galerie],
  }
}

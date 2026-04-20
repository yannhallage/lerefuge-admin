export type Logement = {
  id: string
  nom: string
  /** Prix affiché (nombre, devise gérée à l’affichage) */
  prix: number
  /** Deux photos de présentation */
  photosPresentation: [string, string]
  /** Galerie « critères » / visuels du logement */
  galeriePhotos: string[]
  /** Description libre affichée sur la fiche */
  descriptionChambre: string
  /** IDs des équipements sélectionnés */
  criteresIds: string[]
}

/** Parse une entrée stockée (y compris anciennes fiches sans `criteresIds`). */
export function parseLogement(x: unknown): Logement | null {
  if (!x || typeof x !== "object") return null
  const o = x as Record<string, unknown>
  if (typeof o.id !== "string" || typeof o.nom !== "string") return null
  if (typeof o.prix !== "number" || Number.isNaN(o.prix)) return null
  if (typeof o.descriptionChambre !== "string") return null
  if (!Array.isArray(o.photosPresentation) || o.photosPresentation.length !== 2) return null
  if (!o.photosPresentation.every((p) => typeof p === "string")) return null
  if (!Array.isArray(o.galeriePhotos) || !o.galeriePhotos.every((p) => typeof p === "string")) return null

  let criteresIds: string[] = []
  if (Array.isArray(o.criteresIds)) {
    criteresIds = o.criteresIds.filter((c): c is string => typeof c === "string")
  }

  return {
    id: o.id,
    nom: o.nom,
    prix: o.prix,
    photosPresentation: [o.photosPresentation[0], o.photosPresentation[1]] as [string, string],
    galeriePhotos: [...o.galeriePhotos],
    descriptionChambre: o.descriptionChambre,
    criteresIds,
  }
}

export function isLogementValide(x: unknown): boolean {
  return parseLogement(x) !== null
}

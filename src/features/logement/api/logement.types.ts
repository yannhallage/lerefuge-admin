export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T | null
  statusCode?: number
}

export type LogementAdmin = {
  name: string
  email: string
}

export type LogementItem = {
  logement_id: string
  nom_logement: string
  aire_chambre: number
  prix: number
  nbre_personne?: number | null
  image: string[]
  specification: string[]
  admin?: LogementAdmin | null
}

export type CreateLogementInput = {
  nom_logement: string
  prix: number
  aire_chambre: number
  nbre_personne?: number
  specification: string[]
  images: File[]
}

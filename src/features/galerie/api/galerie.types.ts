export type GalerieItem = {
  galerie_id?: string
  id?: string
  nom?: string
  image?: string
  src?: string
  createdAt?: string
  ajouteeLe?: string
}

export type CreateGalerieInput = {
  nom: string
  image: File
}

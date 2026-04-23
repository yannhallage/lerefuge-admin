export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T | null
  statusCode?: number
}

export type ActiviteAdmin = {
  name: string
  email: string
}

export type ActiviteItem = {
  activite_id: string
  nom: string
  image: string | null
  admin?: ActiviteAdmin | null
}

export type ActiviteImageItem = {
  activite_image_id?: string
  activite_id?: string
  nom?: string
  titre?: string
  image: string
}

export type CreateActiviteInput = {
  nom: string
}

export type UpdateActiviteInput = {
  nom?: string
  image?: File
}

export type CreateActiviteImageInput = {
  image: File
}

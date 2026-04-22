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

export type CreateActiviteInput = {
  nom: string
  image?: File
}

export type UpdateActiviteInput = {
  nom?: string
  image?: File
}

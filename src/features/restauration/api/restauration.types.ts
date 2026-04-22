export type RestaurationItem = {
  resto_id?: string
  id?: string
  nom?: string
  prix?: number | string
  description?: string | null
  image?: string | null
}

export type CreateRestaurationInput = {
  nom: string
  prix: number
  description?: string
  image?: File
}

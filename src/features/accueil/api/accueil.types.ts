export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T | null
  statusCode?: number
}

export type AccueilAdmin = {
  name: string
  email: string
}

export type AccueilItem = {
  accueil_id?: string
  titre: string
  image: string | null
  isFeatured?: boolean
  admin?: AccueilAdmin | null
}

export type AccueilListResponse = ApiEnvelope<AccueilItem[]>
export type AccueilSingleResponse = ApiEnvelope<AccueilItem>

export type CreateAccueilInput = {
  titre: string
  image?: File
}

export type SetFeaturedAccueilInput = {
  accueil_ids: string[]
}

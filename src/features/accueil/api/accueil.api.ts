import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import type {
  AccueilItem,
  AccueilSingleResponse,
  CreateAccueilInput,
  SetFeaturedAccueilInput,
} from "@/features/accueil/api/accueil.types"

function unwrapSingle(payload: unknown): AccueilItem | null {
  if (!payload || typeof payload !== "object") return null
  const first = payload as { data?: unknown }
  if (!first.data || typeof first.data !== "object") return null
  const second = first.data as { data?: unknown }
  if (second.data && typeof second.data === "object") {
    return second.data as AccueilItem
  }
  return first.data as AccueilItem
}

function unwrapList(payload: unknown): AccueilItem[] {
  if (!payload || typeof payload !== "object") return []

  const first = payload as { data?: unknown }
  if (Array.isArray(first.data)) {
    return first.data as AccueilItem[]
  }

  if (!first.data || typeof first.data !== "object") return []
  const second = first.data as { data?: unknown }
  if (Array.isArray(second.data)) {
    return second.data as AccueilItem[]
  }

  return []
}

export const accueilApi = {
  list: async () => {
    const response = await apiClient<unknown>(API_ENDPOINTS.accueil.list)
    return unwrapList(response)
  },
  create: async (input: CreateAccueilInput) => {
    const formData = new FormData()
    formData.append("titre", input.titre)
    // Certains DTO backend valident `image` comme string dans le body multipart.
    // On ajoute donc une valeur texte en plus du fichier pour passer la validation.
    formData.append("image", input.image?.name ?? "image-upload")
    if (input.image) {
      formData.append("image", input.image)
    }

    const response = await apiClient<AccueilSingleResponse>(API_ENDPOINTS.accueil.create, {
      method: "POST",
      body: formData,
    })

    return unwrapSingle(response)
  },
  remove: (id: string) =>
    apiClient<AccueilSingleResponse>(API_ENDPOINTS.accueil.delete(id), {
      method: "DELETE",
    }),
  setFeatured: (input: SetFeaturedAccueilInput) =>
    apiClient<unknown>(API_ENDPOINTS.accueil.selectionner, {
      method: "POST",
      body: JSON.stringify(input),
    }),
}

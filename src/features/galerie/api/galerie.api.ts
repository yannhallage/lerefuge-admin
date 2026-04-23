import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import type { CreateGalerieInput, GalerieItem } from "@/features/galerie/api/galerie.types"

function unwrapList(payload: unknown): GalerieItem[] {
  if (!payload || typeof payload !== "object") return []
  const first = payload as { data?: unknown }
  if (Array.isArray(first.data)) return first.data as GalerieItem[]
  if (!first.data || typeof first.data !== "object") return []
  const second = first.data as { data?: unknown }
  if (Array.isArray(second.data)) return second.data as GalerieItem[]
  return []
}

export const galerieApi = {
  list: async () => {
    const response = await apiClient<unknown>(API_ENDPOINTS.galerie.list)
    return unwrapList(response)
  },
  create: (input: CreateGalerieInput) => {
    const formData = new FormData()
    formData.append("nom", input.nom)
    formData.append("image", input.image.name || "image-upload")
    formData.append("image", input.image)
    return apiClient<unknown>(API_ENDPOINTS.galerie.create, {
      method: "POST",
      body: formData,
    })
  },
  remove: (id: string) =>
    apiClient<unknown>(API_ENDPOINTS.galerie.delete(id), {
      method: "DELETE",
    }),
}

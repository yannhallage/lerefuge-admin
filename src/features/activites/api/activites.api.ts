import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import type { CreateActiviteInput, ActiviteItem, UpdateActiviteInput } from "@/features/activites/api/activites.types"

function unwrapList(payload: unknown): ActiviteItem[] {
  if (!payload || typeof payload !== "object") return []
  const first = payload as { data?: unknown }
  if (Array.isArray(first.data)) return first.data as ActiviteItem[]
  if (!first.data || typeof first.data !== "object") return []
  const second = first.data as { data?: unknown }
  if (Array.isArray(second.data)) return second.data as ActiviteItem[]
  return []
}

export const activitesApi = {
  list: async () => {
    const response = await apiClient<unknown>(API_ENDPOINTS.activites.list, {
      withAuth: false,
    })
    return unwrapList(response)
  },
  create: (input: CreateActiviteInput) => {
    const formData = new FormData()
    formData.append("nom", input.nom)
    if (input.image) {
      formData.append("image", input.image)
    }
    return apiClient<unknown>(API_ENDPOINTS.activites.create, {
      method: "POST",
      body: formData,
    })
  },
  update: (id: string, input: UpdateActiviteInput) => {
    const formData = new FormData()
    if (input.nom !== undefined) {
      formData.append("nom", input.nom)
    }
    if (input.image) {
      formData.append("image", input.image)
    }
    return apiClient<unknown>(API_ENDPOINTS.activites.update(id), {
      method: "PUT",
      body: formData,
    })
  },
  remove: (id: string) =>
    apiClient<unknown>(API_ENDPOINTS.activites.delete(id), {
      method: "DELETE",
    }),
}

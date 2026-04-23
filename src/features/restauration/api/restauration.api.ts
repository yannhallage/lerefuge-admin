import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import type { CreateRestaurationInput, RestaurationItem } from "@/features/restauration/api/restauration.types"

function unwrapPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return null
  const first = payload as { data?: unknown }
  if (!first.data) return null
  if (Array.isArray(first.data)) return first.data
  if (typeof first.data !== "object") return first.data
  const second = first.data as { data?: unknown }
  if (second.data !== undefined) return second.data
  return first.data
}

function unwrapList(payload: unknown): RestaurationItem[] {
  const data = unwrapPayload(payload)
  return Array.isArray(data) ? (data as RestaurationItem[]) : []
}

export const restaurationApi = {
  list: async () => {
    const response = await apiClient<unknown>(API_ENDPOINTS.restauration.list)
    return unwrapList(response)
  },
  create: (input: CreateRestaurationInput) => {
    const formData = new FormData()
    formData.append("nom", input.nom)
    formData.append("prix", String(input.prix))
    if (input.description?.trim()) {
      formData.append("description", input.description.trim())
    }
    if (input.image) {
      formData.append("image", input.image)
    }

    return apiClient<unknown>(API_ENDPOINTS.restauration.create, {
      method: "POST",
      body: formData,
    })
  },
  remove: (id: string) =>
    apiClient<unknown>(API_ENDPOINTS.restauration.delete(id), {
      method: "DELETE",
    }),
}

import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import type { CreateLogementInput, LogementItem } from "@/features/logement/api/logement.types"

function unwrapList(payload: unknown): LogementItem[] {
  if (!payload || typeof payload !== "object") return []
  const first = payload as { data?: unknown }
  if (Array.isArray(first.data)) return first.data as LogementItem[]
  if (!first.data || typeof first.data !== "object") return []
  const second = first.data as { data?: unknown }
  if (Array.isArray(second.data)) return second.data as LogementItem[]
  return []
}

export const logementApi = {
  list: async () => {
    const response = await apiClient<unknown>(API_ENDPOINTS.logement.list)
    return unwrapList(response)
  },
  create: (input: CreateLogementInput) => {
    const formData = new FormData()
    formData.append("nom_logement", input.nom_logement)
    formData.append("prix", String(input.prix))
    formData.append("aire_chambre", String(input.aire_chambre))
    if (input.nbre_personne !== undefined) {
      formData.append("nbre_personne", String(input.nbre_personne))
    }
    formData.append("specification", JSON.stringify(input.specification))
    input.images.forEach((file) => formData.append("image", file))

    return apiClient<unknown>(API_ENDPOINTS.logement.create, {
      method: "POST",
      body: formData,
    })
  },
  remove: (id: string) =>
    apiClient<unknown>(API_ENDPOINTS.logement.delete(id), {
      method: "DELETE",
    }),
}

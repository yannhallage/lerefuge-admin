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

function unwrapOne(payload: unknown): LogementItem | null {
  if (!payload || typeof payload !== "object") return null
  const first = payload as { data?: unknown }
  if (first.data && typeof first.data === "object" && !Array.isArray(first.data)) {
    const maybeItem = first.data as Partial<LogementItem>
    if (typeof maybeItem.logement_id === "string") return first.data as LogementItem
    const second = first.data as { data?: unknown }
    if (second.data && typeof second.data === "object" && !Array.isArray(second.data)) {
      const nestedItem = second.data as Partial<LogementItem>
      if (typeof nestedItem.logement_id === "string") return second.data as LogementItem
    }
  }
  return null
}

function buildLogementFormData(input: CreateLogementInput): FormData {
  const formData = new FormData()
  formData.append("nom_logement", input.nom_logement)
  if (input.description?.trim()) {
    formData.append("description", input.description.trim())
  }
  formData.append("prix", String(input.prix))
  formData.append("aire_chambre", String(input.aire_chambre))
  if (input.nbre_personne !== undefined) {
    formData.append("nbre_personne", String(input.nbre_personne))
  }
  formData.append("specification", JSON.stringify(input.specification))
  input.images.forEach((file) => formData.append("image", file))
  return formData
}

export const logementApi = {
  list: async () => {
    const response = await apiClient<unknown>(API_ENDPOINTS.logement.list)
    return unwrapList(response)
  },
  create: (input: CreateLogementInput) => {
    return apiClient<unknown>(API_ENDPOINTS.logement.create, {
      method: "POST",
      body: buildLogementFormData(input),
    })
  },
  getOne: async (id: string) => {
    const response = await apiClient<unknown>(API_ENDPOINTS.logement.byId(id))
    return unwrapOne(response)
  },
  update: (id: string, input: CreateLogementInput) =>
    apiClient<unknown>(API_ENDPOINTS.logement.update(id), {
      method: "PUT",
      body: buildLogementFormData(input),
    }),
  remove: (id: string) =>
    apiClient<unknown>(API_ENDPOINTS.logement.delete(id), {
      method: "DELETE",
    }),
}

import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import type { CreateActiviteInput, ActiviteItem, UpdateActiviteInput } from "@/features/activites/api/activites.types"
import { ApiError } from "@/api/types"

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
  statusCode?: number
}

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

function unwrapList(payload: unknown): ActiviteItem[] {
  const data = unwrapPayload(payload)
  return Array.isArray(data) ? (data as ActiviteItem[]) : []
}

function assertApiSuccess(payload: unknown) {
  if (!payload || typeof payload !== "object") return
  const envelope = payload as ApiEnvelope<unknown>
  const ok = envelope.success ?? true
  const statusCode = envelope.statusCode ?? 200
  if (ok && statusCode < 400) return

  throw new ApiError(envelope.message ?? "Operation API activites echouee.", statusCode, envelope)
}

export const activitesApi = {
  list: async () => {
    // L'endpoint activites est protege cote API: on conserve l'auth par defaut.
    const response = await apiClient<unknown>(API_ENDPOINTS.activites.list, { withAuth: false })
    assertApiSuccess(response)
    return unwrapList(response)
  },
  create: async (input: CreateActiviteInput) => {
    const formData = new FormData()
    formData.append("nom", input.nom)
    if (input.image) {
      formData.append("image", input.image)
    }
    const response = await apiClient<unknown>(API_ENDPOINTS.activites.create, {
      method: "POST",
      body: formData,
    })
    assertApiSuccess(response)
    return response
  },
  update: async (id: string, input: UpdateActiviteInput) => {
    const formData = new FormData()
    if (input.nom !== undefined) {
      formData.append("nom", input.nom)
    }
    if (input.image) {
      formData.append("image", input.image)
    }
    const response = await apiClient<unknown>(API_ENDPOINTS.activites.update(id), {
      method: "PUT",
      body: formData,
    })
    assertApiSuccess(response)
    return response
  },
  remove: async (id: string) => {
    const response = await apiClient<unknown>(API_ENDPOINTS.activites.delete(id), {
      method: "DELETE",
    })
    assertApiSuccess(response)
    return response
  },
}

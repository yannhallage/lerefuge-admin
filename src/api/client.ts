import { ApiError, type ApiErrorPayload, type ApiMethod } from "@/api/types"
import { requestInterceptors, responseInterceptors } from "@/api/interceptors"
import { getAccessToken } from "@/shared/utils/storage"

const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? ""

function normalizeBaseUrl(base: string): string {
  if (!base) return ""
  return base.replace(/\/+$/, "")
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const base = normalizeBaseUrl(rawBase)
  return base ? `${base}${normalizedPath}` : normalizedPath
}

type ApiRequestConfig = Omit<RequestInit, "method"> & {
  method?: ApiMethod
  withAuth?: boolean
}

export async function apiClient<T>(
  path: string,
  { method = "GET", withAuth = true, headers, ...rest }: ApiRequestConfig = {},
): Promise<T> {
  let request: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    ...rest,
  }

  if (withAuth) {
    const token = getAccessToken()
    if (token) {
      request = {
        ...request,
        headers: {
          ...(request.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      }
    }
  }

  let reqData = { path, method, init: request }
  for (const interceptor of requestInterceptors) {
    reqData = await interceptor(reqData)
  }

  let response = await fetch(buildUrl(reqData.path), reqData.init)
  for (const interceptor of responseInterceptors) {
    response = await interceptor(response)
  }

  const data = (await response.json().catch(() => null)) as ApiErrorPayload | null
  if (!response.ok) {
    throw new ApiError(
      data?.message ?? "Une erreur est survenue lors de l'appel API.",
      response.status,
      data,
    )
  }

  return data as T
}

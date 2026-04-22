import { ApiError, type ApiErrorPayload, type ApiMethod } from "@/api/types"
import { requestInterceptors, responseInterceptors } from "@/api/interceptors"
import { getAccessToken } from "@/shared/utils/storage"

const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? ""
const DEFAULT_TIMEOUT_MS = 15_000

// j'ai ajouté cette fonction pour normaliser l'URL de l'API
function normalizeBaseUrl(base: string): string {
  if (!base) return ""

  const trimmed = base.replace(/\/+$/, "")
  try {
    const url = new URL(trimmed)
    if (import.meta.env.PROD && url.protocol !== "https:") {
      throw new Error("VITE_API_URL doit utiliser HTTPS en production.")
    }
    return url.toString().replace(/\/+$/, "")
  } catch {
    // fallback pour les valeurs relatives (ex: /api)
    return trimmed
  }
}

function buildUrl(path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const base = normalizeBaseUrl(rawBase)
  const target = base ? `${base}${normalizedPath}` : normalizedPath
  if (!query) return target

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, String(item))
      continue
    }
    params.set(key, String(value))
  }
  const queryString = params.toString()
  return queryString ? `${target}?${queryString}` : target
}

type QueryParamValue = string | number | boolean | null | undefined
type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>

type PrimitiveBody = Record<string, unknown> | unknown[]

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData
}

function isStringBody(value: unknown): value is string {
  return typeof value === "string"
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null)
  }

  const text = await response.text().catch(() => "")
  return text || null
}

type ApiRequestConfig = Omit<RequestInit, "method"> & {
  method?: ApiMethod
  withAuth?: boolean
  timeoutMs?: number
  query?: QueryParams
  body?: PrimitiveBody | FormData | string
}

export async function apiClient<T>(
  path: string,
  {
    method = "GET",
    withAuth = true,
    headers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    query,
    body,
    ...rest
  }: ApiRequestConfig = {},
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  const parsedBody =
    body === undefined || isFormData(body) || isStringBody(body)
      ? body
      : JSON.stringify(body)

  const computedHeaders: HeadersInit = {
    ...(isFormData(parsedBody) ? {} : { "Content-Type": "application/json" }),
    ...(headers ?? {}),
  }

  let request: RequestInit = {
    method,
    headers: computedHeaders,
    body: parsedBody,
    signal: controller.signal,
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

  try {
    let response = await fetch(buildUrl(reqData.path, query), reqData.init)
    for (const interceptor of responseInterceptors) {
      response = await interceptor(response)
    }

    const data = (await parseResponseBody(response)) as ApiErrorPayload | null
    if (!response.ok) {
      throw new ApiError(
        (data as ApiErrorPayload | null)?.message ??
          "Une erreur est survenue lors de l'appel API.",
        response.status,
        (data as ApiErrorPayload | null) ?? null,
      )
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("La requete API a expire (timeout).", 408)
    }

    throw new ApiError("Erreur reseau pendant l'appel API.", 0)
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function apiGet<T>(path: string, config?: Omit<ApiRequestConfig, "method">) {
  return apiClient<T>(path, { ...config, method: "GET" })
}

export function apiPost<T>(
  path: string,
  body?: ApiRequestConfig["body"],
  config?: Omit<ApiRequestConfig, "method" | "body">,
) {
  return apiClient<T>(path, { ...config, method: "POST", body })
}

export function apiPut<T>(
  path: string,
  body?: ApiRequestConfig["body"],
  config?: Omit<ApiRequestConfig, "method" | "body">,
) {
  return apiClient<T>(path, { ...config, method: "PUT", body })
}

export function apiPatch<T>(
  path: string,
  body?: ApiRequestConfig["body"],
  config?: Omit<ApiRequestConfig, "method" | "body">,
) {
  return apiClient<T>(path, { ...config, method: "PATCH", body })
}

export function apiDelete<T>(path: string, config?: Omit<ApiRequestConfig, "method">) {
  return apiClient<T>(path, { ...config, method: "DELETE" })
}

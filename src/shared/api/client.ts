const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? ""

function normalizeBaseUrl(base: string): string {
  if (!base) return ""
  const trimmed = base.replace(/\/+$/, "")
  try {
    const url = new URL(trimmed)
    if (import.meta.env.PROD && url.protocol === "http:") {
      url.protocol = "https:"
    }
    return url.origin + url.pathname.replace(/\/+$/, "")
  } catch {
    return trimmed
  }
}

export const apiBaseUrl = normalizeBaseUrl(rawBase)

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  if (!apiBaseUrl) return normalizedPath
  return `${apiBaseUrl}${normalizedPath}`
}

export function httpsFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init)
}

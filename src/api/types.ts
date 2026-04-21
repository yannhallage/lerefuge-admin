export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type ApiErrorPayload = {
  message?: string
  [key: string]: unknown
}

export class ApiError extends Error {
  status: number
  payload?: ApiErrorPayload | null

  constructor(
    message: string,
    status: number,
    payload?: ApiErrorPayload | null,
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

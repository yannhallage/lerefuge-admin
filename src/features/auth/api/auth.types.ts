export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  name: string
}

export type AuthAdmin = {
  admin_id: string
  email: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T | null
  statusCode?: number
}

export type LoginResponse = ApiEnvelope<AuthTokens>
export type RefreshResponse = ApiEnvelope<AuthTokens>
export type RegisterResponse = ApiEnvelope<AuthAdmin>

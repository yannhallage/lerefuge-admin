export type UserRole = "admin" | "editor" | "viewer"

export type User = {
  id: string
  email: string
  fullName: string
  role: UserRole
}

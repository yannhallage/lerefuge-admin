export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    refresh: "/auth/refresh",
  },
  users: {
    list: "/users",
    byId: (id: string) => `/users/${id}`,
  },
} as const

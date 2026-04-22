import { apiClient } from "@/api/client"
import { API_ENDPOINTS } from "@/api/endpoints"
import type { User } from "@/features/users/api/users.types"

export const usersApi = {
  list: () => apiClient<User[]>(API_ENDPOINTS.users.list),
}

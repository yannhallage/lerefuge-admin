import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { restaurationApi } from "@/features/restauration/api/restauration.api"
import type { CreateRestaurationInput } from "@/features/restauration/api/restauration.types"

const RESTAURATION_QUERY_KEY = ["restauration"] as const

export function useRestaurationList() {
  return useQuery({
    queryKey: RESTAURATION_QUERY_KEY,
    queryFn: restaurationApi.list,
  })
}

export function useCreateRestauration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRestaurationInput) => restaurationApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: RESTAURATION_QUERY_KEY })
    },
  })
}

export function useDeleteRestauration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => restaurationApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: RESTAURATION_QUERY_KEY })
    },
  })
}

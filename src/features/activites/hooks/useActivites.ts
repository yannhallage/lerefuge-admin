import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { activitesApi } from "@/features/activites/api/activites.api"
import type { CreateActiviteInput, UpdateActiviteInput } from "@/features/activites/api/activites.types"

const ACTIVITES_QUERY_KEY = ["activites"] as const

export function useActivitesList() {
  return useQuery({
    queryKey: ACTIVITES_QUERY_KEY,
    queryFn: activitesApi.list,
  })
}

export function useCreateActivite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateActiviteInput) => activitesApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIVITES_QUERY_KEY })
    },
  })
}

export function useUpdateActivite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateActiviteInput }) =>
      activitesApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIVITES_QUERY_KEY })
    },
  })
}

export function useDeleteActivite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => activitesApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACTIVITES_QUERY_KEY })
    },
  })
}

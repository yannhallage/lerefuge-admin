import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { logementApi } from "@/features/logement/api/logement.api"
import type { CreateLogementInput } from "@/features/logement/api/logement.types"

const LOGEMENT_QUERY_KEY = ["logement"] as const

export function useLogementList() {
  return useQuery({
    queryKey: LOGEMENT_QUERY_KEY,
    queryFn: logementApi.list,
  })
}

export function useCreateLogement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLogementInput) => logementApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LOGEMENT_QUERY_KEY })
    },
  })
}

export function useUpdateLogement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateLogementInput }) =>
      logementApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LOGEMENT_QUERY_KEY })
    },
  })
}

export function useDeleteLogement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => logementApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LOGEMENT_QUERY_KEY })
    },
  })
}

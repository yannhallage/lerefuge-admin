import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { accueilApi } from "@/features/accueil/api/accueil.api"
import type { CreateAccueilInput, SetFeaturedAccueilInput } from "@/features/accueil/api/accueil.types"

const ACCUEIL_QUERY_KEY = ["accueil"] as const

export function useAccueilList() {
  return useQuery({
    queryKey: ACCUEIL_QUERY_KEY,
    queryFn: accueilApi.list,
  })
}

export function useCreateAccueil() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAccueilInput) => accueilApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACCUEIL_QUERY_KEY })
    },
  })
}

export function useDeleteAccueil() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => accueilApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACCUEIL_QUERY_KEY })
    },
  })
}

export function useSetFeaturedAccueil() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SetFeaturedAccueilInput) => accueilApi.setFeatured(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ACCUEIL_QUERY_KEY })
    },
  })
}

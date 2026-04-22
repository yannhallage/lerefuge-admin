import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { galerieApi } from "@/features/galerie/api/galerie.api"
import type { CreateGalerieInput } from "@/features/galerie/api/galerie.types"

const GALERIE_QUERY_KEY = ["galerie"] as const

export function useGalerieList() {
  return useQuery({
    queryKey: GALERIE_QUERY_KEY,
    queryFn: galerieApi.list,
  })
}

export function useCreateGalerie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGalerieInput) => galerieApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GALERIE_QUERY_KEY })
    },
  })
}

export function useDeleteGalerie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => galerieApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GALERIE_QUERY_KEY })
    },
  })
}

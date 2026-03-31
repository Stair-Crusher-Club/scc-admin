import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  AdminPlaceSpecialAccessibilityDto,
  CreatePlaceSpecialAccessibilityRequestDto,
  UpdatePlaceSpecialAccessibilityRequestDto,
} from "@/lib/generated-sources/openapi"

import { api } from "./api"

// 장소 특수 접근성 목록 조회
export function usePlaceSpecialAccessibilities() {
  return useQuery({
    queryKey: ["@place-special-accessibilities"],
    queryFn: async () => {
      const result = await api.placeSpecialAccessibility.listPlaceSpecialAccessibilities()
      return result.data
    },
    staleTime: 10 * 1000,
  })
}

// 장소 특수 접근성 상세 조회
export function usePlaceSpecialAccessibility({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@place-special-accessibilities", id],
    queryFn: async ({ queryKey }) => {
      const result = await api.placeSpecialAccessibility.getPlaceSpecialAccessibility(queryKey[1])
      return result.data
    },
    staleTime: 10 * 1000,
    enabled: !!id,
  })
}

// 장소 특수 접근성 생성
export async function createPlaceSpecialAccessibility(
  data: CreatePlaceSpecialAccessibilityRequestDto,
): Promise<AdminPlaceSpecialAccessibilityDto> {
  const result = await api.placeSpecialAccessibility.createPlaceSpecialAccessibility(data)
  return result.data
}

// 장소 특수 접근성 생성 mutation hook
export function useCreatePlaceSpecialAccessibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPlaceSpecialAccessibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@place-special-accessibilities"] })
    },
  })
}

// 장소 특수 접근성 수정
export async function updatePlaceSpecialAccessibility(
  id: string,
  data: UpdatePlaceSpecialAccessibilityRequestDto,
): Promise<AdminPlaceSpecialAccessibilityDto> {
  const result = await api.placeSpecialAccessibility.updatePlaceSpecialAccessibility(id, data)
  return result.data
}

// 장소 특수 접근성 수정 mutation hook
export function useUpdatePlaceSpecialAccessibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlaceSpecialAccessibilityRequestDto }) =>
      updatePlaceSpecialAccessibility(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["@place-special-accessibilities"] })
      queryClient.invalidateQueries({ queryKey: ["@place-special-accessibilities", variables.id] })
    },
  })
}

// 장소 특수 접근성 삭제
export async function deletePlaceSpecialAccessibility(id: string): Promise<void> {
  await api.placeSpecialAccessibility.deletePlaceSpecialAccessibility(id)
}

// 장소 특수 접근성 삭제 mutation hook
export function useDeletePlaceSpecialAccessibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePlaceSpecialAccessibility,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@place-special-accessibilities"] })
    },
  })
}

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  AdminCreatePlaceSearchRecommendationRequestDto,
  AdminPlaceSearchRecommendationDto,
  AdminListPlaceSearchRecommendationsResponseDto,
  AdminUpdatePlaceSearchRecommendationRequestDto,
} from "@/lib/generated-sources/openapi"

import { api } from "./api"

// 검색 추천 목록 조회 (cursor pagination)
export function usePlaceSearchRecommendationsInfinite(limit = 20) {
  return useInfiniteQuery<AdminListPlaceSearchRecommendationsResponseDto>({
    queryKey: ["@place-search-recommendations", limit],
    queryFn: ({ pageParam }) =>
      api.placeSearchRecommendation
        .listPlaceSearchRecommendations((pageParam as string | undefined) ?? undefined, limit)
        .then((res) => res.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    staleTime: 10 * 1000,
  })
}

// 검색 추천 생성
export async function createPlaceSearchRecommendation(
  data: AdminCreatePlaceSearchRecommendationRequestDto,
): Promise<AdminPlaceSearchRecommendationDto> {
  const result = await api.placeSearchRecommendation.createPlaceSearchRecommendation(data)
  return result.data
}

// 검색 추천 생성 mutation hook
export function useCreatePlaceSearchRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPlaceSearchRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@place-search-recommendations"] })
    },
  })
}

// 검색 추천 수정
export async function updatePlaceSearchRecommendation(
  id: string,
  data: AdminUpdatePlaceSearchRecommendationRequestDto,
): Promise<AdminPlaceSearchRecommendationDto> {
  const result = await api.placeSearchRecommendation.updatePlaceSearchRecommendation(id, data)
  return result.data
}

// 검색 추천 수정 mutation hook
export function useUpdatePlaceSearchRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdatePlaceSearchRecommendationRequestDto }) =>
      updatePlaceSearchRecommendation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@place-search-recommendations"] })
    },
  })
}

// 검색 추천 삭제
export async function deletePlaceSearchRecommendation(id: string): Promise<void> {
  await api.placeSearchRecommendation.deletePlaceSearchRecommendation(id)
}

// 검색 추천 삭제 mutation hook
export function useDeletePlaceSearchRecommendation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePlaceSearchRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@place-search-recommendations"] })
    },
  })
}

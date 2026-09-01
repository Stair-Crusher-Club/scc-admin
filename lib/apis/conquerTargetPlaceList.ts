import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  AdminAddPlacesToConquerTargetPlaceListResponseDto,
  AdminCreateConquerTargetPlaceListRequestDto,
  AdminListConquerTargetPlacesResponseDto,
  AdminUpdateConquerTargetPlaceListRequestDto,
} from "@/lib/generated-sources/openapi"

import { api } from "./api"

// 정복 대상 리스트 목록 조회
export function useConquerTargetPlaceLists() {
  return useQuery({
    queryKey: ["@conquer-target-place-lists"],
    queryFn: async () => {
      const result = await api.conquerTargetPlaceList.listConquerTargetPlaceLists()
      return result.data.items
    },
    staleTime: 10 * 1000,
  })
}

// 정복 대상 리스트 상세 조회
export function useConquerTargetPlaceListDetail({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@conquer-target-place-lists", id],
    queryFn: async ({ queryKey }) => {
      const result = await api.conquerTargetPlaceList.getConquerTargetPlaceList(queryKey[1])
      return result.data
    },
    staleTime: 10 * 1000,
    enabled: !!id,
  })
}

// 정복 대상 리스트에 포함된 장소 목록 조회 (커서 페이지네이션)
export function useConquerTargetPlaceListPlaces({ id, limit = 20 }: { id: string; limit?: number }) {
  return useInfiniteQuery<AdminListConquerTargetPlacesResponseDto>({
    queryKey: ["@conquer-target-place-lists", id, "places"],
    queryFn: ({ pageParam }) =>
      api.conquerTargetPlaceList
        .listConquerTargetPlaces(id, (pageParam as string | undefined) ?? undefined, limit)
        .then((res) => res.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    staleTime: 10 * 1000,
    enabled: !!id,
  })
}

// 정복 대상 리스트 생성
export async function createConquerTargetPlaceList(data: AdminCreateConquerTargetPlaceListRequestDto) {
  const result = await api.conquerTargetPlaceList.createConquerTargetPlaceList(data)
  return result.data
}

// 정복 대상 리스트 생성 mutation hook
export function useCreateConquerTargetPlaceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createConquerTargetPlaceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@conquer-target-place-lists"] })
    },
  })
}

// 정복 대상 리스트 수정
export async function updateConquerTargetPlaceList(
  id: string,
  data: AdminUpdateConquerTargetPlaceListRequestDto,
) {
  const result = await api.conquerTargetPlaceList.updateConquerTargetPlaceList(id, data)
  return result.data
}

// 정복 대상 리스트 수정 mutation hook
export function useUpdateConquerTargetPlaceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateConquerTargetPlaceListRequestDto }) =>
      updateConquerTargetPlaceList(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["@conquer-target-place-lists"] })
      queryClient.invalidateQueries({ queryKey: ["@conquer-target-place-lists", variables.id] })
    },
  })
}

// 정복 대상 리스트 삭제
export async function deleteConquerTargetPlaceList(id: string) {
  await api.conquerTargetPlaceList.deleteConquerTargetPlaceList(id)
}

// 정복 대상 리스트 삭제 mutation hook
export function useDeleteConquerTargetPlaceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteConquerTargetPlaceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@conquer-target-place-lists"] })
    },
  })
}

// 정복 대상 리스트에 장소 일괄 추가
export async function addPlacesToConquerTargetPlaceList(
  id: string,
  placeIds: string[],
): Promise<AdminAddPlacesToConquerTargetPlaceListResponseDto> {
  const result = await api.conquerTargetPlaceList.addPlacesToConquerTargetPlaceList(id, { placeIds })
  return result.data
}

// 정복 대상 리스트에 장소 일괄 추가 mutation hook
export function useAddPlacesToConquerTargetPlaceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, placeIds }: { id: string; placeIds: string[] }) =>
      addPlacesToConquerTargetPlaceList(id, placeIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["@conquer-target-place-lists"] })
      queryClient.invalidateQueries({ queryKey: ["@conquer-target-place-lists", variables.id] })
    },
  })
}

// 정복 대상 리스트에서 장소 제거
export async function removePlaceFromConquerTargetPlaceList(id: string, placeId: string) {
  await api.conquerTargetPlaceList.removePlaceFromConquerTargetPlaceList(id, placeId)
}

// 정복 대상 리스트에서 장소 제거 mutation hook
export function useRemovePlaceFromConquerTargetPlaceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, placeId }: { id: string; placeId: string }) =>
      removePlaceFromConquerTargetPlaceList(id, placeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["@conquer-target-place-lists"] })
      queryClient.invalidateQueries({ queryKey: ["@conquer-target-place-lists", variables.id] })
    },
  })
}

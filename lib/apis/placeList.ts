import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  AdminCreatePlaceListRequestDto,
  AdminPlaceListDetailDto,
  AdminUpdatePlaceListRequestDto,
} from "@/lib/generated-sources/openapi"

import { api } from "./api"

// 저장 리스트 목록 조회
export function usePlaceLists() {
  return useQuery({
    queryKey: ["@place-lists"],
    queryFn: async () => {
      const result = await api.placeList.listPlaceLists()
      return result.data.items
    },
    staleTime: 10 * 1000,
  })
}

// 저장 리스트 상세 조회
export function usePlaceListDetail({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@place-lists", id],
    queryFn: async ({ queryKey }) => {
      const result = await api.placeList.getPlaceList(queryKey[1])
      return result.data
    },
    staleTime: 10 * 1000,
    enabled: !!id,
  })
}

// 저장 리스트 생성
export async function createPlaceList(data: AdminCreatePlaceListRequestDto): Promise<AdminPlaceListDetailDto> {
  const result = await api.placeList.createPlaceList(data)
  return result.data
}

// 저장 리스트 생성 mutation hook
export function useCreatePlaceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPlaceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@place-lists"] })
    },
  })
}

// 저장 리스트 수정
export async function updatePlaceList(
  id: string,
  data: AdminUpdatePlaceListRequestDto,
): Promise<AdminPlaceListDetailDto> {
  const result = await api.placeList.updatePlaceList(id, data)
  return result.data
}

// 저장 리스트 수정 mutation hook
export function useUpdatePlaceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdatePlaceListRequestDto }) => updatePlaceList(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["@place-lists"] })
      queryClient.invalidateQueries({ queryKey: ["@place-lists", variables.id] })
    },
  })
}

// 저장 리스트 삭제
export async function deletePlaceList(id: string): Promise<void> {
  await api.placeList.deletePlaceList(id)
}

// 저장 리스트 삭제 mutation hook
export function useDeletePlaceList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePlaceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@place-lists"] })
    },
  })
}

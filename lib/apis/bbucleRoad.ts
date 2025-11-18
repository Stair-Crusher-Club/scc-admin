import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  BbucleRoadPageDTO,
  CreateBbucleRoadPageRequestDTO,
  UpdateBbucleRoadPageRequestDTO,
} from "@/lib/generated-sources/openapi"

import { api } from "./api"

// 뿌클로드 페이지 목록 조회
export function useBbucleRoadPages() {
  return useQuery({
    queryKey: ["@bbucle-road-pages"],
    queryFn: async () => {
      const result = await api.bbucleRoad.listBbucleRoadPages()
      return result.data
    },
    staleTime: 10 * 1000,
  })
}

// 뿌클로드 페이지 상세 조회
export function useBbucleRoadPage({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@bbucle-road-pages", id],
    queryFn: async ({ queryKey }) => {
      const result = await api.bbucleRoad.getBbucleRoadPage(queryKey[1])
      return result.data
    },
    staleTime: 10 * 1000,
    enabled: !!id,
  })
}

// 뿌클로드 페이지 생성
export async function createBbucleRoadPage(data: CreateBbucleRoadPageRequestDTO): Promise<BbucleRoadPageDTO> {
  const result = await api.bbucleRoad.createBbucleRoadPage(data)
  return result.data
}

// 뿌클로드 페이지 생성 mutation hook
export function useCreateBbucleRoadPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBbucleRoadPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@bbucle-road-pages"] })
    },
  })
}

// 뿌클로드 페이지 수정
export async function updateBbucleRoadPage(id: string, data: UpdateBbucleRoadPageRequestDTO): Promise<BbucleRoadPageDTO> {
  const result = await api.bbucleRoad.updateBbucleRoadPage(id, data)
  return result.data
}

// 뿌클로드 페이지 수정 mutation hook
export function useUpdateBbucleRoadPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBbucleRoadPageRequestDTO }) =>
      updateBbucleRoadPage(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["@bbucle-road-pages"] })
      queryClient.invalidateQueries({ queryKey: ["@bbucle-road-pages", variables.id] })
    },
  })
}

// 뿌클로드 페이지 삭제
export async function deleteBbucleRoadPage(id: string): Promise<void> {
  await api.bbucleRoad.deleteBbucleRoadPage(id)
}

// 뿌클로드 페이지 삭제 mutation hook
export function useDeleteBbucleRoadPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBbucleRoadPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@bbucle-road-pages"] })
    },
  })
}

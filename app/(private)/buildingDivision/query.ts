import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import {
  AdminBuildingDivisionDetailDTO,
  AdminBuildingDivisionStatusDTO,
  AdminBuildingDivisionWithCountDTO,
  AdminCreateSubBuildingRequestDTO,
  AdminSubBuildingDTO,
} from "@/lib/generated-sources/openapi"

export interface ListBuildingDivisionsResult {
  items: AdminBuildingDivisionWithCountDTO[]
  cursor: string | null
}

export function useBuildingDivisions(status?: AdminBuildingDivisionStatusDTO) {
  return useInfiniteQuery({
    queryKey: ["@buildingDivisions", status],
    queryFn: ({ pageParam }) =>
      api.buildingDivision
        .listBuildingDivisions(status, undefined, pageParam ?? undefined)
        .then((res) => res.data as ListBuildingDivisionsResult),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
  })
}

export function useBuildingDivision(divisionId: string) {
  return useQuery({
    queryKey: ["@buildingDivision", divisionId],
    queryFn: () => api.buildingDivision.getBuildingDivision(divisionId).then((res) => res.data as AdminBuildingDivisionDetailDTO),
  })
}

export function useConfirmBuildingDivision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (divisionId: string) => api.buildingDivision.confirmBuildingDivision(divisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@buildingDivisions"] })
      queryClient.invalidateQueries({ queryKey: ["@buildingDivision"] })
    },
  })
}

export function useIgnoreBuildingDivision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (divisionId: string) => api.buildingDivision.ignoreBuildingDivision(divisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@buildingDivisions"] })
      queryClient.invalidateQueries({ queryKey: ["@buildingDivision"] })
    },
  })
}

export function useCreateSubBuilding(divisionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminCreateSubBuildingRequestDTO) =>
      api.buildingDivision.createSubBuilding(divisionId, data).then((res) => res.data as AdminSubBuildingDTO),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@buildingDivision", divisionId] })
    },
  })
}

export function useAssignPlacesToSubBuildings(divisionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.buildingDivision.assignPlacesToSubBuildings(divisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["@buildingDivision", divisionId] })
    },
  })
}

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import {
  AdminConfirmPlaceAccessibilitySuggestionRequestDto,
  AdminRejectPlaceAccessibilitySuggestionRequestDto,
  AdminUpdatePlaceAccessibilitySuggestionRequestDto,
  SuggestionStatusDto,
} from "@/lib/generated-sources/openapi"

const SUGGESTIONS_KEY = ["@accessibility-suggestions"]
const SUGGESTION_KEY = (id: string) => ["@accessibility-suggestion", id]

export function useSuggestions({ status }: { status?: SuggestionStatusDto } = {}) {
  return useInfiniteQuery({
    queryKey: [...SUGGESTIONS_KEY, status ?? null],
    queryFn: ({ pageParam }) =>
      api.placeAccessibilitySuggestion
        .searchPlaceAccessibilitySuggestions(status, pageParam ?? undefined, 20)
        .then((res) => res.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

export function useSuggestion(id: string) {
  return useQuery({
    queryKey: SUGGESTION_KEY(id),
    queryFn: () =>
      api.placeAccessibilitySuggestion.getPlaceAccessibilitySuggestion(id).then((res) => res.data),
    enabled: !!id,
  })
}

export function useUpdateSuggestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdatePlaceAccessibilitySuggestionRequestDto }) =>
      api.placeAccessibilitySuggestion.updatePlaceAccessibilitySuggestion(id, payload).then((res) => res.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: SUGGESTIONS_KEY })
      queryClient.invalidateQueries({ queryKey: SUGGESTION_KEY(variables.id) })
    },
  })
}

export function useConfirmSuggestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: AdminConfirmPlaceAccessibilitySuggestionRequestDto }) =>
      api.placeAccessibilitySuggestion.confirmPlaceAccessibilitySuggestion(id, payload).then((res) => res.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: SUGGESTIONS_KEY })
      queryClient.invalidateQueries({ queryKey: SUGGESTION_KEY(variables.id) })
    },
  })
}

export function useRejectSuggestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: AdminRejectPlaceAccessibilitySuggestionRequestDto }) =>
      api.placeAccessibilitySuggestion.rejectPlaceAccessibilitySuggestion(id, payload).then((res) => res.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: SUGGESTIONS_KEY })
      queryClient.invalidateQueries({ queryKey: SUGGESTION_KEY(variables.id) })
    },
  })
}

export function useDeleteSuggestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.placeAccessibilitySuggestion.deletePlaceAccessibilitySuggestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUGGESTIONS_KEY })
    },
  })
}

export function useBulkConfirmSuggestions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (suggestionIds: string[]) =>
      api.placeAccessibilitySuggestion.bulkConfirmPlaceAccessibilitySuggestions({ suggestionIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUGGESTIONS_KEY })
    },
  })
}

export const statusLabels: Record<SuggestionStatusDto, string> = {
  [SuggestionStatusDto.Pending]: "대기",
  [SuggestionStatusDto.Confirmed]: "확인",
  [SuggestionStatusDto.Rejected]: "반려",
}

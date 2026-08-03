import { useInfiniteQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { AdminClosedPlaceCandidateDTO, AdminClosedPlaceCandidateFilterDTO } from "@/lib/generated-sources/openapi"

export interface ListClosedPlaceCandidatesResult {
  items: AdminClosedPlaceCandidateDTO[]
  cursor: string | null
}

export function useClosedPlaceCandidates(filter: AdminClosedPlaceCandidateFilterDTO) {
  return useInfiniteQuery({
    queryKey: ["@closedPlaceCandidates", filter],
    queryFn: ({ pageParam }) =>
      // 페이지 크기 10은 검수자가 목록을 훑기에 너무 작다 — 서버 기본값과 같은 50으로.
      api.default
        .listClosedPlaceCandidates(filter, undefined, pageParam ?? undefined, "50")
        .then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

export async function acceptClosedPlaceCandidate({ id }: { id: string }) {
  return api.default.acceptClosedPlaceCandidate(id).then((res) => res.data)
}

export async function ignoreClosedPlaceCandidate({ id }: { id: string }) {
  return api.default.ignoreClosedPlaceCandidate(id).then((res) => res.data)
}

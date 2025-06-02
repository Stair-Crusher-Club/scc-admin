import { useInfiniteQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { AdminClosedPlaceCandidateDTO } from "@/lib/generated-sources/openapi"

export interface ListClosedPlaceCandidatesResult {
  items: AdminClosedPlaceCandidateDTO[]
  cursor: string | null
}

export function useClosedPlaceCandidates(isAccessibilityRegistered: boolean) {
  return useInfiniteQuery({
    queryKey: ["@closedPlaceCandidates", isAccessibilityRegistered],
    queryFn: ({ pageParam }) =>
      api.default.listClosedPlaceCandidates(isAccessibilityRegistered, pageParam ?? undefined, "10").then((res) => res.data),
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

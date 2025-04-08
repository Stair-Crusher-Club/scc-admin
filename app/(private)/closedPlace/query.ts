import { useInfiniteQuery } from "@tanstack/react-query"
import qs from "query-string"

import { http } from "@/lib/http"
import { ClosedPlaceCandidate } from "@/lib/models/place"

export interface ListClosedPlaceCandidatesResult {
  items: ClosedPlaceCandidate[]
  cursor: string | null
}

export function useClosedPlaceCandidates(isAccessibilityRegistered: boolean) {
  return useInfiniteQuery({
    queryKey: ["@closedPlaceCandidates", isAccessibilityRegistered],
    queryFn: ({ pageParam }) =>
      http(
        `/admin/closed-place-candidates?${qs.stringify(
          {
            cursor: pageParam,
            limit: 10,
            isAccessibilityRegistered,
          },
          { skipNull: true },
        )}`,
      ).then((res) => res.json() as Promise<ListClosedPlaceCandidatesResult>),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

export function acceptClosedPlaceCandidate({ id }: { id: string }) {
  return http(`/admin/closed-place-candidates/${id}/accept`, {
    method: "PUT",
  })
}

export function ignoreClosedPlaceCandidate({ id }: { id: string }) {
  return http(`/admin/closed-place-candidates/${id}/ignore`, {
    method: "PUT",
  })
}

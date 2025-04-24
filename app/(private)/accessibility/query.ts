import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { SearchAccessibilitiesPayload } from "@/lib/apis/api"

export function useAccessibilities(payload: SearchAccessibilitiesPayload) {
  return useInfiniteQuery({
    queryKey: ["@accessibilities", payload],
    queryFn: ({ pageParam }) =>
      api
        .searchAccessibilities(
          payload.placeName,
          payload.createdAtFromLocalDate,
          payload.createdAtToLocalDate,
          pageParam ?? undefined,
          "10",
        )
        .then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

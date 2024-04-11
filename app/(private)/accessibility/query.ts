import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import qs from "query-string"

import { http } from "@/lib/http"
import { SearchAccessibilitiesPayload, SearchAccessibilitiesResult } from "@/lib/apis/api";

export function useAccessibilities(payload: SearchAccessibilitiesPayload) {
  return useInfiniteQuery({
    queryKey: ["@accessibilities", payload],
    queryFn: ({ pageParam }) =>
      http(
        `/admin/accessibilities/search?${qs.stringify(
          { ...payload, cursor: pageParam, limit: 10 },
          { skipNull: true },
        )}`,
      ).then((res) => res.json() as Promise<SearchAccessibilitiesResult>),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

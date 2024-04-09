import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import qs from "query-string"

import { SearchAccessibilitiesResult } from "@/lib/apis/api"
import { http } from "@/lib/http"

export function useAccessibilities(placeName: string) {
  return useInfiniteQuery({
    queryKey: ["@accessibilities", { placeName }],
    queryFn: ({ pageParam }) =>
      http(
        `/admin/accessibilities/search?${qs.stringify(
          { placeName, cursor: pageParam, limit: 10 },
          { skipNull: true },
        )}`,
      ).then((res) => res.json() as Promise<SearchAccessibilitiesResult>),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

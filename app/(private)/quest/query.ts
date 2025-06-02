import { useInfiniteQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { ClubQuestSummaryDTO } from "@/lib/generated-sources/openapi"

export function useClubQuestSummaries() {
  return useInfiniteQuery({
    queryKey: ["@clubQuestSummaries"],
    queryFn: ({ pageParam }) =>
      api.default.getCursoredClubQuestSummaries(pageParam ?? undefined, "100").then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

export interface GetCursoredClubQuestSummariesResult {
  list: ClubQuestSummaryDTO[]
  cursor: string | null
}

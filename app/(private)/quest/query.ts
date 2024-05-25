import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import qs from "query-string"

import { http } from "@/lib/http"
import { QuestSummary } from "@/lib/models/quest"

export function useClubQuestSummaries() {
  return useInfiniteQuery({
    queryKey: ["@clubQuestSummaries"],
    queryFn: ({ pageParam }) =>
      http(
        `/admin/clubQuestSummaries/cursored?${qs.stringify(
          { cursor: pageParam, limit: 10 },
          { skipNull: true },
        )}`,
      ).then((res) => res.json() as Promise<GetCursoredClubQuestSummariesResult>),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

export interface GetCursoredClubQuestSummariesResult {
  items: QuestSummary[]
  cursor: string | null
}

import { useInfiniteQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { QuestSummary } from "@/lib/models/quest"

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
  list: QuestSummary[]
  cursor: string | null
}

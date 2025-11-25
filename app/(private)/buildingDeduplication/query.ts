import { useInfiniteQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { AdminBuildingDeduplicationCandidateDTO } from "@/lib/generated-sources/openapi"

export interface ListBuildingDeduplicationCandidatesResult {
  items: AdminBuildingDeduplicationCandidateDTO[]
  cursor: string | null
}

export function useBuildingDeduplicationCandidates() {
  return useInfiniteQuery({
    queryKey: ["@buildingDeduplicationCandidates"],
    queryFn: ({ pageParam }) =>
      api.default.listBuildingDeduplicationCandidates(10, pageParam ?? undefined).then((res) => res.data),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

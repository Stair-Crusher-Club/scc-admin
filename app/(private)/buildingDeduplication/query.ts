import { useInfiniteQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { AdminBuildingDeduplicationCandidateDTO } from "@/lib/generated-sources/openapi"

export interface ListBuildingDeduplicationCandidatesResult {
  items: AdminBuildingDeduplicationCandidateDTO[]
  cursor: string | null
}

export function useBuildingDeduplicationCandidates() {
  // TODO: API endpoint was removed, needs to be re-implemented
  return useInfiniteQuery({
    queryKey: ["@buildingDeduplicationCandidates"],
    queryFn: () => Promise.resolve({ items: [], cursor: null }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

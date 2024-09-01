import { useMutation } from "@tanstack/react-query"

import { http } from "@/lib/http"
import { LatLng } from "@/lib/models/common"
import { QuestSummary } from "@/lib/models/quest"

export function useCrawling() {
  return useMutation({
    mutationFn: (boundaryVertices: LatLng[]) =>
      http("/admin/places/startCrawling", { method: "POST", body: JSON.stringify({ boundaryVertices }) }),
  })
}

export interface GetCursoredClubQuestSummariesResult {
  list: QuestSummary[]
  cursor: string | null
}

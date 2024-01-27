import { useQuery } from "@tanstack/react-query"

import { http } from "../http"
import { QuestDetail, QuestSummary } from "../models/quest"

export function useQuests() {
  return useQuery({
    queryKey: ["@quests"],
    queryFn: () => http("/admin/clubQuests").then((res) => res.json() as Promise<QuestSummary[]>),
  })
}

export function useQuest({ id }: { id: string }) {
  return useQuery({
    queryKey: ["@quests", id],
    queryFn: ({ queryKey }) =>
      http(`/admin/clubQuests/${queryKey[1]}`).then((res) => res.json() as Promise<QuestDetail>),
  })
}

type UpdateQuestStatusParams = {
  questId: string
  placeId: string
  buildingId: string
  isClosed?: boolean
  isNotAccessible?: boolean
}
export async function updateQuestStatus({ questId, ...params }: UpdateQuestStatusParams) {
  if (typeof params.isClosed == "boolean") {
    await http(`/admin/clubQuests/${questId}/isClosed`, {
      method: "PUT",
      body: JSON.stringify(params),
    })
  }
  if (typeof params.isNotAccessible == "boolean") {
    await http(`/admin/clubQuests/${questId}/isNotAccessible`, {
      method: "PUT",
      body: JSON.stringify(params),
    })
  }
}

type PreviewDivisionsParams = {
  centerLocation: { lng: number; lat: number }
  clusterCount: number
  maxPlaceCountPerQuest: number
  radiusMeters: number
}
export async function previewDivisions(params: PreviewDivisionsParams) {
  return http(`/admin/clubQuests/create/dryRun`, {
    method: "POST",
    body: JSON.stringify(params),
  })
}

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

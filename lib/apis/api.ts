import { useQuery } from "@tanstack/react-query"

import { http } from "../http"
import { QuestSummary } from "../models/quest"

export function fetchQuests() {
  return http("https://api.staircrusher.club/admin/clubQuests").then((res) => res.json() as Promise<QuestSummary[]>)
}

export function useQuests() {
  return useQuery({ queryKey: ["@quests"], queryFn: fetchQuests })
}

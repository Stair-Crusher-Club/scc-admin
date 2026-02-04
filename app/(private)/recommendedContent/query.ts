import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { EpochMillisTimestamp } from "@/lib/generated-sources/openapi"

export function useHomeRecommendedContents() {
  return useQuery({
    queryKey: ["@homeRecommendedContents"],
    queryFn: () => api.homeRecommendedContent.adminListHomeRecommendedContents().then(res => res.data),
  })
}

export interface CreateHomeRecommendedContentParam {
  title: string
  description: string
  imageUrl: string
  linkUrl: string
  displayOrder: number
  startAt?: EpochMillisTimestamp
  endAt?: EpochMillisTimestamp
}

export function createHomeRecommendedContent(payload: CreateHomeRecommendedContentParam) {
  return api.homeRecommendedContent.adminCreateHomeRecommendedContent(payload)
}

export function deleteHomeRecommendedContent(id: string) {
  return api.homeRecommendedContent.adminDeleteHomeRecommendedContent(id)
}

export interface HomeRecommendedContent {
  id: string
  title: string
  description: string
  imageUrl: string
  linkUrl: string
  displayOrder: number
  startAt?: EpochMillisTimestamp
  endAt?: EpochMillisTimestamp
}

import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { EpochMillisTimestamp } from "@/lib/generated-sources/openapi"

export function useHomeAnnouncements() {
  return useQuery({
    queryKey: ["@homeAnnouncements"],
    queryFn: () => api.homeAnnouncement.adminListHomeAnnouncements().then(res => res.data),
  })
}

export interface CreateHomeAnnouncementParam {
  text: string
  linkUrl: string
  displayOrder: number
  startAt?: EpochMillisTimestamp
  endAt?: EpochMillisTimestamp
}

export function createHomeAnnouncement(payload: CreateHomeAnnouncementParam) {
  return api.homeAnnouncement.adminCreateHomeAnnouncement(payload)
}

export function deleteHomeAnnouncement(id: string) {
  return api.homeAnnouncement.adminDeleteHomeAnnouncement(id)
}

export interface HomeAnnouncement {
  id: string
  text: string
  linkUrl: string
  displayOrder: number
  startAt?: EpochMillisTimestamp
  endAt?: EpochMillisTimestamp
}

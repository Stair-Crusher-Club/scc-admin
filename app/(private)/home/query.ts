import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { EpochMillisTimestamp, HomeBannerTypeDTO } from "@/lib/generated-sources/openapi"

// === Banner ===

export function useAllBanners() {
  return useQuery({
    queryKey: ["@allBanners"],
    queryFn: () => api.banner.adminAllListBanners().then((res) => res.data),
  })
}

export function useHomeBanners() {
  return useQuery({
    queryKey: ["@homeBanners"],
    queryFn: () => api.banner.adminListHomeBanners().then((res) => res.data),
  })
}

export interface CreateBannerParam {
  loggingKey: string
  imageUrl: string
  clickPageUrl: string
  clickPageTitle: string
  startAt?: EpochMillisTimestamp
  endAt?: EpochMillisTimestamp
  displayOrder: number
  bannerType: HomeBannerTypeDTO
}

export function createBanner(payload: CreateBannerParam) {
  return api.banner.adminCreateBanner(payload)
}

export function deleteBanner(banner: Banner) {
  return api.banner.adminDeleteBanner(banner.id)
}

export interface Banner {
  id: string
  loggingKey: string
  imageUrl: string
  clickPageUrl: string
  clickPageTitle: string
  startAt?: EpochMillisTimestamp
  endAt?: EpochMillisTimestamp
  displayOrder: number
  bannerType: HomeBannerTypeDTO
}

export const bannerTypeLabels: Record<HomeBannerTypeDTO, string> = {
  [HomeBannerTypeDTO.Main]: "메인 홈 배너",
  [HomeBannerTypeDTO.Strip]: "띠 홈 배너",
}

// === Announcement ===

export function useHomeAnnouncements() {
  return useQuery({
    queryKey: ["@homeAnnouncements"],
    queryFn: () => api.homeAnnouncement.adminListHomeAnnouncements().then((res) => res.data),
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

// === Home Popup ===

export function useHomePopups() {
  return useQuery({
    queryKey: ["@homePopups"],
    queryFn: () => api.homePopup.adminListHomePopups().then((res) => res.data),
  })
}

export interface CreateHomePopupParam {
  imageUrl: string
  displayOrder: number
  startAt?: EpochMillisTimestamp
  endAt?: EpochMillisTimestamp
}

export function createHomePopup(payload: CreateHomePopupParam) {
  return api.homePopup.adminCreateHomePopup(payload)
}

export function deleteHomePopup(id: string) {
  return api.homePopup.adminDeleteHomePopup(id)
}

export interface HomePopup {
  id: string
  imageUrl: string
  displayOrder: number
  startAt?: EpochMillisTimestamp
  endAt?: EpochMillisTimestamp
}

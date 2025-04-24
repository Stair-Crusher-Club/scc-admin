import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/apis/api"
import { EpochMillisTimestamp } from "@/lib/models/common"

export function useAllBanners() {
  return useQuery({
    queryKey: ["@allBanners"],
    queryFn: () => api.banner.adminAllListBanners().then(res => res.data),
  })
}

export function useHomeBanners() {
  return useQuery({
    queryKey: ["@homeBanners"],
    queryFn: () => api.banner.adminListHomeBanners().then(res => res.data),
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
}
export function createBanner(payload: CreateBannerParam) {
  return api.banner.adminCreateBanner(payload)
}

export function deleteBanner(banner: Banner) {
  return api.banner.adminDeleteBanner(banner.id)
}

export interface GetAllBannersResult {
  banners: Banner[]
}

export interface GetHomeBannersResult {
  banners: Banner[]
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
}

import { useQuery } from "@tanstack/react-query"

import { http } from "@/lib/http"
import { EpochMillisTimestamp } from "@/lib/models/common"

export function useAllBanners() {
  return useQuery({
    queryKey: ["@allBanners"],
    queryFn: () => http("/admin/banners").then((res) => res.json() as Promise<GetAllBannersResult>),
  })
}

export function useHomeBanners() {
  return useQuery({
    queryKey: ["@homeBanners"],
    queryFn: () => http("/admin/banners/home-banner").then((res) => res.json() as Promise<GetHomeBannersResult>),
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
  return http("/admin/banners", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function deleteBanner(banner: Banner) {
  return http(`/admin/banners/${banner.id}`, {
    method: "DELETE",
  })
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

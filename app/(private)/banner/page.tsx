"use client"

import { useQueryClient } from "@tanstack/react-query"
import { format as formatDate } from "date-fns"
import { useRouter } from "next/navigation"

import { Contents } from "@/components/layout"
import { PageActions } from "@/components/page-actions"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { HomeBannerTypeDTO } from "@/lib/generated-sources/openapi"

import { Banner, bannerTypeLabels, deleteBanner, useAllBanners, useHomeBanners } from "./query"

const dateFormat = "yyyy.MM.dd HH:mm"

export default function BannerList() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const allBanners = useAllBanners()?.data?.banners ?? []
  const homeBanners = useHomeBanners()?.data?.banners ?? []
  const homeMainBanners = homeBanners.filter((b) => b.bannerType === HomeBannerTypeDTO.Main)
  const homeStripBanners = homeBanners.filter((b) => b.bannerType === HomeBannerTypeDTO.Strip)

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm(`정말 ${banner.loggingKey} 배너를 삭제하시겠습니까?`)) {
      return
    }
    await deleteBanner(banner)
    await queryClient.invalidateQueries({ queryKey: ["@allBanners"] })
    await queryClient.invalidateQueries({ queryKey: ["@homeBanners"] })
  }

  return (
    <Contents.Normal>
      <PageActions>
        <Button onClick={() => router.push("/banner/create")} size="sm">
          배너 추가
        </Button>
      </PageActions>

      <h3 className="text-lg font-semibold mb-2">전체 배너</h3>
      <BannerTable banners={allBanners} onDelete={handleDeleteBanner} />

      <h3 className="text-lg font-semibold mt-6 mb-2">홈 메인 배너</h3>
      <BannerTable banners={homeMainBanners} onDelete={handleDeleteBanner} />

      <h3 className="text-lg font-semibold mt-6 mb-2">홈 띠 배너</h3>
      <BannerTable banners={homeStripBanners} onDelete={handleDeleteBanner} />
    </Contents.Normal>
  )
}

function BannerTable({
  banners,
  onDelete,
}: {
  banners: Banner[]
  onDelete: (banner: Banner) => Promise<void>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>로깅 키</TableHead>
          <TableHead>배너 타입</TableHead>
          <TableHead>랜딩 페이지 제목</TableHead>
          <TableHead>랜딩 페이지 링크</TableHead>
          <TableHead>배너 노출 순서</TableHead>
          <TableHead>배너 사진</TableHead>
          <TableHead>배너 노출 기간</TableHead>
          <TableHead>삭제</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {banners.map((banner) => (
          <TableRow key={banner.id}>
            <TableCell>{banner.loggingKey}</TableCell>
            <TableCell>{bannerTypeLabels[banner.bannerType]}</TableCell>
            <TableCell>{banner.clickPageTitle}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" asChild>
                <a href={banner.clickPageUrl} target="_blank" rel="noopener noreferrer">
                  오픈
                </a>
              </Button>
            </TableCell>
            <TableCell>{banner.displayOrder}</TableCell>
            <TableCell>
              <img
                src={banner.imageUrl}
                alt=""
                className="max-w-[300px] max-h-[100px] object-contain block"
              />
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <p>시작 : {banner.startAt ? formatDate(new Date(banner.startAt.value), dateFormat) : "-"}</p>
              <p>종료 : {banner.endAt ? formatDate(new Date(banner.endAt.value), dateFormat) : "-"}</p>
            </TableCell>
            <TableCell>
              <Button variant="destructive" size="sm" onClick={() => onDelete(banner)}>
                삭제
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {banners.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              데이터가 없습니다.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

"use client"

import { useQueryClient } from "@tanstack/react-query"
import { format as formatDate } from "date-fns"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { Contents } from "@/components/layout"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EpochMillisTimestamp, HomeBannerTypeDTO } from "@/lib/generated-sources/openapi"

import {
  Banner,
  bannerTypeLabels,
  deleteBanner,
  deleteHomeAnnouncement,
  deleteHomePopup,
  HomeAnnouncement,
  HomePopup,
  useAllBanners,
  useHomeAnnouncements,
  useHomePopups,
} from "./query"

const dateFormat = "yyyy.MM.dd HH:mm"

function isActiveNow(startAt?: EpochMillisTimestamp, endAt?: EpochMillisTimestamp): boolean {
  const now = Date.now()
  if (startAt && startAt.value > now) return false
  if (endAt && endAt.value < now) return false
  return true
}

export default function HomePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  const allBanners = useAllBanners()?.data?.banners ?? []
  const announcements = useHomeAnnouncements()?.data?.announcements ?? []
  const popups = useHomePopups()?.data?.popups ?? []

  const filteredMainBanners = useMemo(() => {
    const banners = allBanners.filter((b) => b.bannerType === HomeBannerTypeDTO.Main)
    return showActiveOnly ? banners.filter((b) => isActiveNow(b.startAt, b.endAt)) : banners
  }, [showActiveOnly, allBanners])

  const filteredStripBanners = useMemo(() => {
    const banners = allBanners.filter((b) => b.bannerType === HomeBannerTypeDTO.Strip)
    return showActiveOnly ? banners.filter((b) => isActiveNow(b.startAt, b.endAt)) : banners
  }, [showActiveOnly, allBanners])

  const filteredAnnouncements = useMemo(() => {
    return showActiveOnly ? announcements.filter((a) => isActiveNow(a.startAt, a.endAt)) : announcements
  }, [showActiveOnly, announcements])

  const filteredPopups = useMemo(() => {
    return showActiveOnly ? popups.filter((p) => isActiveNow(p.startAt, p.endAt)) : popups
  }, [showActiveOnly, popups])

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm(`정말 ${banner.loggingKey} 배너를 삭제하시겠습니까?`)) {
      return
    }
    await deleteBanner(banner)
    await queryClient.invalidateQueries({ queryKey: ["@allBanners"] })
    await queryClient.invalidateQueries({ queryKey: ["@homeBanners"] })
  }

  const handleDeleteAnnouncement = async (announcement: HomeAnnouncement) => {
    if (!confirm(`정말 "${announcement.text}" 공지사항을 삭제하시겠습니까?`)) {
      return
    }
    await deleteHomeAnnouncement(announcement.id)
    await queryClient.invalidateQueries({ queryKey: ["@homeAnnouncements"] })
  }

  const handleDeletePopup = async (popup: HomePopup) => {
    if (!confirm("정말 이 팝업을 삭제하시겠습니까?")) {
      return
    }
    await deleteHomePopup(popup.id)
    await queryClient.invalidateQueries({ queryKey: ["@homePopups"] })
  }

  return (
    <Contents.Normal>
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={showActiveOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setShowActiveOnly((prev) => !prev)}
        >
          {showActiveOnly ? "✓ 현재 노출 중인 것만 보기" : "현재 노출 중인 것만 보기"}
        </Button>
      </div>

      {/* 메인 배너 섹션 */}
      <div className="flex items-center justify-between mt-4 mb-2">
        <h3 className="text-lg font-semibold">메인 배너</h3>
        <Button onClick={() => router.push("/home/create-banner")} size="sm">
          배너 추가
        </Button>
      </div>
      <BannerTable banners={filteredMainBanners} onDelete={handleDeleteBanner} />

      {/* 띠 배너 섹션 */}
      <h3 className="text-lg font-semibold mt-6 mb-2">띠 배너</h3>
      <BannerTable banners={filteredStripBanners} onDelete={handleDeleteBanner} />

      {/* 공지사항 섹션 */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <h3 className="text-lg font-semibold">공지사항</h3>
        <Button onClick={() => router.push("/home/create-announcement")} size="sm">
          공지 추가
        </Button>
      </div>
      <AnnouncementTable announcements={filteredAnnouncements} onDelete={handleDeleteAnnouncement} />

      {/* 홈 팝업 섹션 */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <h3 className="text-lg font-semibold">홈 팝업</h3>
        <Button onClick={() => router.push("/home/create-popup")} size="sm">
          팝업 추가
        </Button>
      </div>
      <PopupTable popups={filteredPopups} onDelete={handleDeletePopup} />
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

function AnnouncementTable({
  announcements,
  onDelete,
}: {
  announcements: HomeAnnouncement[]
  onDelete: (announcement: HomeAnnouncement) => Promise<void>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>텍스트</TableHead>
          <TableHead>링크 URL</TableHead>
          <TableHead>노출 순서</TableHead>
          <TableHead>노출 기간</TableHead>
          <TableHead>삭제</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {announcements.map((announcement) => (
          <TableRow key={announcement.id}>
            <TableCell className="max-w-[300px] truncate">{announcement.text}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" asChild>
                <a href={announcement.linkUrl} target="_blank" rel="noopener noreferrer">
                  오픈
                </a>
              </Button>
            </TableCell>
            <TableCell>{announcement.displayOrder}</TableCell>
            <TableCell className="whitespace-nowrap">
              <p>시작 : {announcement.startAt ? formatDate(new Date(announcement.startAt.value), dateFormat) : "-"}</p>
              <p>종료 : {announcement.endAt ? formatDate(new Date(announcement.endAt.value), dateFormat) : "-"}</p>
            </TableCell>
            <TableCell>
              <Button variant="destructive" size="sm" onClick={() => onDelete(announcement)}>
                삭제
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {announcements.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              데이터가 없습니다.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function PopupTable({
  popups,
  onDelete,
}: {
  popups: HomePopup[]
  onDelete: (popup: HomePopup) => Promise<void>
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이미지</TableHead>
          <TableHead>노출 순서</TableHead>
          <TableHead>노출 기간</TableHead>
          <TableHead>삭제</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {popups.map((popup) => (
          <TableRow key={popup.id}>
            <TableCell>
              <img
                src={popup.imageUrl}
                alt=""
                className="max-w-[300px] max-h-[100px] object-contain block"
              />
            </TableCell>
            <TableCell>{popup.displayOrder}</TableCell>
            <TableCell className="whitespace-nowrap">
              <p>시작 : {popup.startAt ? formatDate(new Date(popup.startAt.value), dateFormat) : "-"}</p>
              <p>종료 : {popup.endAt ? formatDate(new Date(popup.endAt.value), dateFormat) : "-"}</p>
            </TableCell>
            <TableCell>
              <Button variant="destructive" size="sm" onClick={() => onDelete(popup)}>
                삭제
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {popups.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              데이터가 없습니다.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

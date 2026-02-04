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

import { deleteHomeAnnouncement, HomeAnnouncement, useHomeAnnouncements } from "./query"

const dateFormat = "yyyy.MM.dd HH:mm"

export default function AnnouncementList() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const announcements = useHomeAnnouncements()?.data?.announcements ?? []

  const handleDelete = async (announcement: HomeAnnouncement) => {
    if (!confirm(`정말 "${announcement.text}" 공지사항을 삭제하시겠습니까?`)) {
      return
    }
    await deleteHomeAnnouncement(announcement.id)
    await queryClient.invalidateQueries({ queryKey: ["@homeAnnouncements"] })
  }

  return (
    <Contents.Normal>
      <PageActions>
        <Button onClick={() => router.push("/announcement/create")} size="sm">
          공지사항 추가
        </Button>
      </PageActions>

      <h3 className="text-lg font-semibold mb-2">공지사항 목록</h3>
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
                <Button variant="destructive" size="sm" onClick={() => handleDelete(announcement)}>
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
    </Contents.Normal>
  )
}

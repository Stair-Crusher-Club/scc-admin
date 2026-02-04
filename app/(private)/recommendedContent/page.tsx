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

import { deleteHomeRecommendedContent, HomeRecommendedContent, useHomeRecommendedContents } from "./query"

const dateFormat = "yyyy.MM.dd HH:mm"

export default function RecommendedContentList() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const contents = useHomeRecommendedContents()?.data?.contents ?? []

  const handleDelete = async (content: HomeRecommendedContent) => {
    if (!confirm(`정말 "${content.title}" 추천 컨텐츠를 삭제하시겠습니까?`)) {
      return
    }
    await deleteHomeRecommendedContent(content.id)
    await queryClient.invalidateQueries({ queryKey: ["@homeRecommendedContents"] })
  }

  return (
    <Contents.Normal>
      <PageActions>
        <Button onClick={() => router.push("/recommendedContent/create")} size="sm">
          추천 컨텐츠 추가
        </Button>
      </PageActions>

      <h3 className="text-lg font-semibold mb-2">추천 컨텐츠 목록</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>설명</TableHead>
            <TableHead>이미지</TableHead>
            <TableHead>링크</TableHead>
            <TableHead>노출 순서</TableHead>
            <TableHead>노출 기간</TableHead>
            <TableHead>삭제</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents.map((content) => (
            <TableRow key={content.id}>
              <TableCell className="max-w-[150px] truncate">{content.title}</TableCell>
              <TableCell className="max-w-[200px] truncate">{content.description}</TableCell>
              <TableCell>
                <img
                  src={content.imageUrl}
                  alt=""
                  className="max-w-[100px] max-h-[80px] object-contain block"
                />
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <a href={content.linkUrl} target="_blank" rel="noopener noreferrer">
                    오픈
                  </a>
                </Button>
              </TableCell>
              <TableCell>{content.displayOrder}</TableCell>
              <TableCell className="whitespace-nowrap">
                <p>시작 : {content.startAt ? formatDate(new Date(content.startAt.value), dateFormat) : "-"}</p>
                <p>종료 : {content.endAt ? formatDate(new Date(content.endAt.value), dateFormat) : "-"}</p>
              </TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(content)}>
                  삭제
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {contents.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Contents.Normal>
  )
}

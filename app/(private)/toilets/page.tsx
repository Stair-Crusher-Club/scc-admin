"use client"

import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { CheckCircle2, EyeOff, ImageOff, RotateCcw } from "lucide-react"
import { useState } from "react"

import { setToiletSearchable, useToilets } from "@/lib/apis/api"
import { AdminToiletDto, AdminToiletReviewDetailDto } from "@/lib/generated-sources/openapi"

import { Contents } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const TOILET_LOCATION_TYPE_LABELS: Record<string, string> = {
  PLACE: "장소",
  BUILDING: "건물",
  NONE: "없음",
  ETC: "기타",
}

function getToiletLocationTypeLabel(type: string | undefined): string {
  if (!type) return "-"
  return TOILET_LOCATION_TYPE_LABELS[type] ?? type
}

// isSearchable 필터: all(전체) | false(미노출) | true(검색노출)
type SearchableFilter = "all" | "false" | "true"

export default function ToiletsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 기본값: 미노출(isSearchable=false) 큐레이션 큐
  const [filterSearchable, setFilterSearchable] = useState<SearchableFilter>("false")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const isSearchableParam = filterSearchable === "all" ? undefined : filterSearchable === "true"

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useToilets({
    isSearchable: isSearchableParam,
    limit: 20,
  })

  const items: AdminToiletDto[] = data?.pages.flatMap((p) => p.items) ?? []

  const handleReset = () => {
    setFilterSearchable("false")
  }

  const handleToggleSearchable = async (item: AdminToiletDto) => {
    const nextValue = !item.isSearchable
    setTogglingId(item.id)
    try {
      await setToiletSearchable({ id: item.id, isSearchable: nextValue })
      toast({
        title: nextValue ? "검색 허용 완료" : "검색 제외 완료",
        description: nextValue
          ? "해당 화장실이 즉시 검색에 노출됩니다."
          : "해당 화장실이 즉시 검색에서 제외됩니다.",
      })
      queryClient.invalidateQueries({ queryKey: ["@toilets"] })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "처리 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "처리 실패",
        description: errorMessage,
      })
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <Contents.Normal>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>장애인 화장실 큐레이션</CardTitle>
          <CardDescription>
            유저 리뷰로 등록된 화장실을 검토해 검색 노출 여부를 결정합니다. &quot;검색 허용&quot;으로 설정하면 즉시
            화장실 검색에 노출되고, &quot;검색 제외&quot;로 설정하면 즉시 제외됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>검색 노출 여부</Label>
              <Select value={filterSearchable} onValueChange={(value) => setFilterSearchable(value as SearchableFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="false">미노출 (검색 제외)</SelectItem>
                  <SelectItem value="true">검색 노출</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">조회된 화장실이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ToiletCard
              key={item.id}
              item={item}
              isToggling={togglingId === item.id}
              onToggle={() => handleToggleSearchable(item)}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "불러오는 중..." : "더 불러오기"}
          </Button>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">현재 {items.length}개 항목 표시 중</div>
      )}
    </Contents.Normal>
  )
}

function ToiletCard({
  item,
  isToggling,
  onToggle,
}: {
  item: AdminToiletDto
  isToggling: boolean
  onToggle: () => void
}) {
  const reviewDetails = item.toiletReviewDetails ?? []

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4">
        {/* 헤더 */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold">{item.name}</span>
            {item.isSearchable ? (
              <Badge variant="default">검색 노출</Badge>
            ) : (
              <Badge variant="destructive">미노출</Badge>
            )}
            {item.hasExternalSource && <Badge variant="secondary">공공데이터 병합</Badge>}
            {reviewDetails.length === 0 && (
              <Badge variant="outline" className="gap-1">
                <ImageOff className="h-3 w-3" />
                유저 리뷰 없음
              </Badge>
            )}
          </div>

          {item.address && <p className="text-sm text-muted-foreground">{item.address}</p>}

          <p className="text-xs text-muted-foreground">
            등록일시: {dayjs(item.createdAt.value).format("YYYY-MM-DD HH:mm")}
          </p>
        </div>

        {/* 유저 리뷰 상세 (병합된 리뷰 모두 표시) */}
        {reviewDetails.length > 0 && (
          <div className="flex flex-col gap-3">
            {reviewDetails.map((detail, index) => (
              <ToiletReviewDetail key={index} detail={detail} index={index} total={reviewDetails.length} />
            ))}
          </div>
        )}

        {/* 액션 */}
        <div className="flex justify-end">
          {item.isSearchable ? (
            <Button variant="destructive" onClick={onToggle} disabled={isToggling} className="gap-2">
              <EyeOff className="h-4 w-4" />
              {isToggling ? "처리 중..." : "검색 제외"}
            </Button>
          ) : (
            <Button onClick={onToggle} disabled={isToggling} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {isToggling ? "처리 중..." : "검색 허용"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ToiletReviewDetail({
  detail,
  index,
  total,
}: {
  detail: AdminToiletReviewDetailDto
  index: number
  total: number
}) {
  return (
    <div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
      {total > 1 && <p className="text-xs font-semibold text-muted-foreground">리뷰 {index + 1}</p>}
      <p>
        <span className="font-semibold">위치 유형:</span> {getToiletLocationTypeLabel(detail.toiletLocationType)}
      </p>
      {detail.locationComment && (
        <p>
          <span className="font-semibold">위치 코멘트:</span> {detail.locationComment}
        </p>
      )}
      {detail.comment && (
        <p>
          <span className="font-semibold">기타 참고사항:</span> {detail.comment}
        </p>
      )}
      {detail.images && detail.images.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {detail.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.thumbnailUrl || img.imageUrl}
              alt="화장실 사진"
              className="h-20 w-20 rounded-md border object-cover"
            />
          ))}
        </div>
      )}
    </div>
  )
}

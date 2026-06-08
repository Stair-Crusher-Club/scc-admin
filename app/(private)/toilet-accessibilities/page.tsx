"use client"

import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { CheckCircle2, EyeOff, ImageOff, RotateCcw } from "lucide-react"
import { useState } from "react"

import { setToiletAccessibilitySearchable, useToiletAccessibilities } from "@/lib/apis/api"
import { AdminToiletAccessibilityDto, ToiletAccessibilitySourceTypeDto } from "@/lib/generated-sources/openapi"

import { Contents } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const SOURCE_TYPE_OPTIONS: { value: ToiletAccessibilitySourceTypeDto; label: string }[] = [
  { value: ToiletAccessibilitySourceTypeDto.UserToiletReview, label: "유저 등록" },
  { value: ToiletAccessibilitySourceTypeDto.ExternalAccessibility, label: "공공데이터" },
]

function getSourceTypeLabel(sourceType: ToiletAccessibilitySourceTypeDto): string {
  return SOURCE_TYPE_OPTIONS.find((o) => o.value === sourceType)?.label ?? sourceType
}

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

// isSearchable 필터: undefined(전체) | false(미검토) | true(검색대상)
type SearchableFilter = "all" | "false" | "true"

export default function ToiletAccessibilitiesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // 기본값: 유저 등록 + 미검토(isSearchable=false) 큐레이션 큐
  const [filterSourceType, setFilterSourceType] = useState<ToiletAccessibilitySourceTypeDto | undefined>(
    ToiletAccessibilitySourceTypeDto.UserToiletReview,
  )
  const [filterSearchable, setFilterSearchable] = useState<SearchableFilter>("false")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const isSearchableParam = filterSearchable === "all" ? undefined : filterSearchable === "true"

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useToiletAccessibilities({
    sourceType: filterSourceType,
    isSearchable: isSearchableParam,
    limit: 20,
  })

  const items: AdminToiletAccessibilityDto[] = data?.pages.flatMap((p) => p.items) ?? []

  const handleReset = () => {
    setFilterSourceType(ToiletAccessibilitySourceTypeDto.UserToiletReview)
    setFilterSearchable("false")
  }

  const handleToggleSearchable = async (item: AdminToiletAccessibilityDto) => {
    const nextValue = !item.isSearchable
    setTogglingId(item.id)
    try {
      await setToiletAccessibilitySearchable({ id: item.id, isSearchable: nextValue })
      toast({
        title: nextValue ? "검색 허용 완료" : "검색 제외 완료",
        description: nextValue
          ? "해당 화장실이 즉시 검색에 노출됩니다."
          : "해당 화장실이 즉시 검색에서 제외됩니다.",
      })
      queryClient.invalidateQueries({ queryKey: ["@toiletAccessibilities"] })
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
            유저가 등록한 화장실(유저 등록 소스)을 검토해 검색 노출 여부를 결정합니다. &quot;검색 허용&quot;으로
            설정하면 즉시 화장실 검색에 노출되고, &quot;검색 제외&quot;로 설정하면 즉시 제외됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>데이터 소스</Label>
              <Select
                value={filterSourceType ?? "all"}
                onValueChange={(value) =>
                  setFilterSourceType(value === "all" ? undefined : (value as ToiletAccessibilitySourceTypeDto))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {SOURCE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>검색 노출 여부</Label>
              <Select value={filterSearchable} onValueChange={(value) => setFilterSearchable(value as SearchableFilter)}>
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="false">미검토 (검색 제외)</SelectItem>
                  <SelectItem value="true">검색 대상</SelectItem>
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
            <ToiletAccessibilityCard
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

function ToiletAccessibilityCard({
  item,
  isToggling,
  onToggle,
}: {
  item: AdminToiletAccessibilityDto
  isToggling: boolean
  onToggle: () => void
}) {
  const detail = item.toiletReviewDetail
  const isUserSource = item.sourceType === ToiletAccessibilitySourceTypeDto.UserToiletReview

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
        {/* 썸네일 */}
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnailUrl} alt="화장실 썸네일" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageOff className="h-6 w-6" />
              <span className="text-xs">사진 없음</span>
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold">{item.name}</span>
            <Badge variant={isUserSource ? "secondary" : "outline"}>{getSourceTypeLabel(item.sourceType)}</Badge>
            {item.isSearchable ? (
              <Badge variant="default">검색 대상</Badge>
            ) : (
              <Badge variant="destructive">미검토</Badge>
            )}
            {!item.hasImage && <Badge variant="outline">사진 없음</Badge>}
          </div>

          {item.address && <p className="text-sm text-muted-foreground">{item.address}</p>}

          <p className="text-xs text-muted-foreground">
            등록일시: {dayjs(item.createdAt.value).format("YYYY-MM-DD HH:mm")}
          </p>

          {/* 유저 등록 소스 상세 */}
          {isUserSource && detail && (
            <div className="mt-1 space-y-1 rounded-md bg-muted/50 p-3 text-sm">
              <p>
                <span className="font-semibold">위치 유형:</span>{" "}
                {getToiletLocationTypeLabel(detail.toiletLocationType)}
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
          )}
        </div>

        {/* 액션 */}
        <div className="flex shrink-0 items-start">
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

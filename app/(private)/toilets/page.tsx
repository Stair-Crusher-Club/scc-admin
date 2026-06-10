"use client"

import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { CheckCircle2, EyeOff, ImageOff, RotateCcw } from "lucide-react"
import { useState } from "react"

import { setToiletSearchable, useToilets } from "@/lib/apis/api"
import {
  AdminToiletAccessibilityDetailsDto,
  AdminToiletAccessibilityDto,
  AdminToiletDto,
} from "@/lib/generated-sources/openapi"

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

function getToiletLocationTypeLabel(type: string | null | undefined): string {
  if (!type) return "-"
  return TOILET_LOCATION_TYPE_LABELS[type] ?? type
}

// 공공데이터(toiletDetails) 필드 라벨 — 표시 순서 유지
const TOILET_DETAILS_FIELDS: { key: keyof AdminToiletAccessibilityDetailsDto; label: string }[] = [
  { key: "gender", label: "성별 구분" },
  { key: "accessDesc", label: "접근 방법" },
  { key: "availableDesc", label: "이용 가능 정보" },
  { key: "entranceDesc", label: "출입구" },
  { key: "stallWidth", label: "칸 너비" },
  { key: "stallDepth", label: "칸 깊이" },
  { key: "doorDesc", label: "문" },
  { key: "doorSideRoom", label: "문 옆 여유 공간" },
  { key: "washStandBelowRoom", label: "세면대 하부 공간" },
  { key: "washStandHandle", label: "세면대 손잡이" },
  { key: "extraDesc", label: "기타 정보" },
]

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
  const accessibilities = item.toiletAccessibilities ?? []

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
            {accessibilities.length === 0 && (
              <Badge variant="outline" className="gap-1">
                <ImageOff className="h-3 w-3" />
                접근성 정보 없음
              </Badge>
            )}
          </div>

          {item.address && <p className="text-sm text-muted-foreground">{item.address}</p>}

          <p className="text-xs text-muted-foreground">
            등록일시: {dayjs(item.createdAt.value).format("YYYY-MM-DD HH:mm")}
          </p>
        </div>

        {/* 접근성 정보 상세 (유저 리뷰 + 공공데이터, 병합된 소스 모두 표시) */}
        {accessibilities.length > 0 && (
          <div className="flex flex-col gap-3">
            {accessibilities.map((accessibility, index) => (
              <ToiletAccessibilityDetail
                key={accessibility.id}
                accessibility={accessibility}
                index={index}
                total={accessibilities.length}
              />
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

function ToiletAccessibilityImages({ images }: { images: AdminToiletAccessibilityDto["images"] }) {
  if (!images || images.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {images.map((img) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.id}
          src={img.thumbnailUrl || img.imageUrl}
          alt="화장실 사진"
          className="h-20 w-20 rounded-md border object-cover"
        />
      ))}
    </div>
  )
}

function ToiletAccessibilityDetail({
  accessibility,
  index,
  total,
}: {
  accessibility: AdminToiletAccessibilityDto
  index: number
  total: number
}) {
  // 소스 판별: toiletDetails(공공데이터)가 있으면 공공 소스, 없으면 유저 리뷰 소스.
  // sourceType 분기 없이 존재하는 필드로 표시한다.
  const isPublicSource = accessibility.toiletDetails != null

  return (
    <div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
      <div className="flex items-center gap-2">
        {total > 1 && <span className="text-xs font-semibold text-muted-foreground">소스 {index + 1}</span>}
        <Badge variant={isPublicSource ? "secondary" : "outline"} className="text-xs">
          {isPublicSource ? "공공데이터" : "유저 리뷰"}
        </Badge>
      </div>

      {isPublicSource ? (
        <PublicToiletDetails details={accessibility.toiletDetails!} />
      ) : (
        <>
          <p>
            <span className="font-semibold">위치 유형:</span>{" "}
            {getToiletLocationTypeLabel(accessibility.toiletLocationType)}
          </p>
          {accessibility.locationComment && (
            <p>
              <span className="font-semibold">위치 코멘트:</span> {accessibility.locationComment}
            </p>
          )}
          {accessibility.comment && (
            <p>
              <span className="font-semibold">기타 참고사항:</span> {accessibility.comment}
            </p>
          )}
        </>
      )}

      <ToiletAccessibilityImages images={accessibility.images} />
    </div>
  )
}

function PublicToiletDetails({ details }: { details: AdminToiletAccessibilityDetailsDto }) {
  const rows = TOILET_DETAILS_FIELDS.filter(({ key }) => {
    const value = details[key]
    return value != null && value !== ""
  })

  if (rows.length === 0) {
    return <p className="text-muted-foreground">표시할 공공데이터 정보가 없습니다.</p>
  }

  return (
    <>
      {rows.map(({ key, label }) => (
        <p key={key}>
          <span className="font-semibold">{label}:</span> {details[key]}
        </p>
      ))}
    </>
  )
}

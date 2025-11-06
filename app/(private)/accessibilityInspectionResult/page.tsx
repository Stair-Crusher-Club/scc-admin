"use client"

import { useMemo, useState } from "react"
import { format as formatDate } from "date-fns"
import { ChevronDown, ChevronUp, RefreshCw, RotateCcw } from "lucide-react"
import { useModal } from "@/hooks/useModal"

import { runImagePipeline, useAccessibilityInspectionResultsPaginated } from "@/lib/apis/api"
import {
  AccessibilityTypeDTO,
  AdminAccessibilityInspectionResultDTO,
  InspectorTypeDTO,
  ResultTypeDTO,
} from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Contents, Header } from "@/components/layout"
import RemoteImage from "@/components/RemoteImage"

export default function AccessibilityInspectionResultPage() {
  const [accessibilityType, setAccessibilityType] = useState<AccessibilityTypeDTO | undefined>()
  const [inspectorType, setInspectorType] = useState<InspectorTypeDTO | undefined>()
  const [resultType, setResultType] = useState<ResultTypeDTO | undefined>()
  const [isHandled, setIsHandled] = useState<boolean | undefined>()
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [isRunningPipeline, setIsRunningPipeline] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const modal = useModal()

  const { data, isLoading, refetch } = useAccessibilityInspectionResultsPaginated({
    accessibilityType,
    inspectorType,
    resultType,
    isHandled,
    createdAtFromLocalDate: fromDate || undefined,
    createdAtToLocalDate: toDate || undefined,
    page: currentPage,
    pageSize,
  })

  const items = data?.items ?? []
  const hasNextPage = data?.hasNextPage ?? false
  const totalPages = data?.totalPages ?? 1

  const handleRunReinspection = async (items: Array<{ accessibilityId: string; accessibilityType: AccessibilityTypeDTO }>) => {
    setIsRunningPipeline(true)
    try {
      await runImagePipeline({ items })
      alert("재검수가 성공적으로 실행되었습니다.")
      refetch()
    } catch (error) {
      console.error("재검수 실행 중 오류:", error)
      alert("재검수 실행 중 오류가 발생했습니다.")
    } finally {
      setIsRunningPipeline(false)
    }
  }

  const openReinspectionDialog = () => {
    modal.openModal({
      type: "ReinspectionDialog",
      props: {
        onConfirm: handleRunReinspection,
        isLoading: isRunningPipeline,
      },
    })
  }

  const toggleRowExpansion = (itemId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const loadImages = (itemId: string) => {
    setLoadedImages((prev) => new Set(prev).add(itemId))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setExpandedRows(new Set())
    setLoadedImages(new Set())
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize))
    setCurrentPage(1)
    setExpandedRows(new Set())
    setLoadedImages(new Set())
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    setExpandedRows(new Set())
    setLoadedImages(new Set())
  }

  const resetFilters = () => {
    setAccessibilityType(undefined)
    setInspectorType(undefined)
    setResultType(undefined)
    setIsHandled(undefined)
    setFromDate("")
    setToDate("")
    handleFilterChange()
  }

  return (
    <>
      <Header title="접근성 검증 결과" />
      <Contents.Normal>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>검색 필터</CardTitle>
            <CardDescription>검증 결과를 필터링하여 조회할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>유형</Label>
                <Select
                  value={accessibilityType ?? "all"}
                  onValueChange={(value) => {
                    setAccessibilityType(value === "all" ? undefined : (value as AccessibilityTypeDTO))
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="Place">Place</SelectItem>
                    <SelectItem value="Building">Building</SelectItem>
                    <SelectItem value="PlaceReview">PlaceReview</SelectItem>
                    <SelectItem value="ToiletReview">ToiletReview</SelectItem>
                    <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>검수자 유형</Label>
                <Select
                  value={inspectorType ?? "all"}
                  onValueChange={(value) => {
                    setInspectorType(value === "all" ? undefined : (value as InspectorTypeDTO))
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="HUMAN">HUMAN</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>검수 결과</Label>
                <Select
                  value={resultType ?? "all"}
                  onValueChange={(value) => {
                    setResultType(value === "all" ? undefined : (value as ResultTypeDTO))
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="OK">OK</SelectItem>
                    <SelectItem value="MODIFY">MODIFY</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>처리 여부</Label>
                <Select
                  value={typeof isHandled === "boolean" ? String(isHandled) : "all"}
                  onValueChange={(value) => {
                    setIsHandled(value === "all" ? undefined : value === "true")
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="true">처리됨</SelectItem>
                    <SelectItem value="false">미처리</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromDate">시작일</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value)
                    handleFilterChange()
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toDate">종료일</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value)
                    handleFilterChange()
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>페이지 크기</Label>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10개</SelectItem>
                    <SelectItem value="20">20개</SelectItem>
                    <SelectItem value="50">50개</SelectItem>
                    <SelectItem value="100">100개</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={resetFilters} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                초기화
              </Button>
              <Button onClick={openReinspectionDialog} disabled={isRunningPipeline} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${isRunningPipeline ? "animate-spin" : ""}`} />
                {isRunningPipeline ? "재검수 중..." : "재검수하기"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">로딩 중...</p>
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">결과가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            items.map((item: AdminAccessibilityInspectionResultDTO) => {
              const isExpanded = expandedRows.has(item.id)
              const imagesLoaded = loadedImages.has(item.id)
              const images = item.images ?? []
              let imageInspectionResult = null
              try {
                if (item.contents) {
                  imageInspectionResult = JSON.parse(item.contents)
                }
              } catch (e) {
                console.error("Failed to parse inspection result contents", e)
              }

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {item.accessibilityName ? `${item.accessibilityName} - ` : ""}
                          {item.accessibilityId}
                        </CardTitle>
                        <CardDescription>{item.accessibilityType}</CardDescription>
                      </div>
                      <Badge variant={item.resultType === "OK" ? "default" : "destructive"}>
                        {item.resultType}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">생성일</p>
                        <p className="text-sm">{formatDate(new Date(item.createdAtMillis), "yyyy/M/d HH:mm")}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">설명</p>
                        <p className="text-sm">{imageInspectionResult?.description || "설명 없음"}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-semibold mb-3">이미지</h4>
                      {images.length > 0 ? (
                        imagesLoaded ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {images.map((img: any, idx: number) => (
                              <div key={idx} className="relative aspect-video overflow-hidden rounded-md border">
                                <RemoteImage
                                  src={(img.thumbnailUrl ?? img.imageUrl) as string}
                                  width={120}
                                  height={90}
                                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => loadImages(item.id)}>
                            이미지 로드 ({images.length}개)
                          </Button>
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground italic">이미지 없음</p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => toggleRowExpansion(item.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          상세 정보 접기
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          상세 정보 보기
                        </>
                      )}
                    </Button>
                  </CardContent>

                  {isExpanded && (
                    <div className="border-t bg-muted/30 p-6">
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2">상세 검수 결과</h3>

                      <div className="space-y-6">
                        <div>
                          <Label className="text-sm font-semibold mb-2 block">전체 코드</Label>
                          <div className="flex flex-wrap gap-2">
                            {imageInspectionResult?.overallCodes?.map((code: string, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {code}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold mb-2 block">이미지별 상세</Label>
                          <div className="space-y-3">
                            {imageInspectionResult?.images?.map((imgDetail: any, idx: number) => (
                              <div key={idx} className="bg-background border rounded-lg p-4">
                                <p className="text-xs font-mono text-muted-foreground mb-2 break-all bg-muted px-2 py-1 rounded">
                                  {imgDetail.url}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {imgDetail.reasonCodes?.map((code: string, codeIdx: number) => (
                                    <Badge key={codeIdx} variant="outline">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <Label className="text-sm font-semibold mb-1 block">생성일</Label>
                            <p className="text-sm font-mono text-muted-foreground">
                              {formatDate(new Date(item.createdAtMillis), "yyyy-MM-dd HH:mm:ss")}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-semibold mb-1 block">수정일</Label>
                            <p className="text-sm font-mono text-muted-foreground">
                              {formatDate(new Date(item.updatedAtMillis), "yyyy-MM-dd HH:mm:ss")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>

        {items.length > 0 && (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <p className="text-sm text-muted-foreground font-medium">
                페이지 {currentPage} / {totalPages} (총 {items.length}개 항목)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← 이전
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  다음 →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </Contents.Normal>
    </>
  )
}

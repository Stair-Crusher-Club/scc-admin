"use client"

import { useState } from "react"
import { RotateCcw } from "lucide-react"

import { useAccessibilityInspectionResultsPaginated } from "@/lib/apis/api"
import {
  AccessibilityTypeDTO,
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
import { Contents, Header } from "@/components/layout"

import { getColumns } from "./components/columns"
import { InspectionResultTable } from "./components/InspectionResultTable"

export default function AccessibilityInspectionResultPage() {
  const [accessibilityType, setAccessibilityType] = useState<AccessibilityTypeDTO | undefined>()
  const [inspectorType, setInspectorType] = useState<InspectorTypeDTO | undefined>()
  const [resultType, setResultType] = useState<ResultTypeDTO | undefined>()
  const [isHandled, setIsHandled] = useState<boolean | undefined>()
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [accessibilityName, setAccessibilityName] = useState<string>("")
  const [accessibilityId, setAccessibilityId] = useState<string>("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading } = useAccessibilityInspectionResultsPaginated({
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
    setAccessibilityName("")
    setAccessibilityId("")
    handleFilterChange()
  }

  const columns = getColumns({
    expandedRows,
    loadedImages,
    toggleRowExpansion,
    loadImages,
  })

  // Filter data based on local filters
  const filteredItems = items.filter((item) => {
    if (accessibilityName && !item.accessibilityName?.toLowerCase().includes(accessibilityName.toLowerCase())) {
      return false
    }
    if (accessibilityId && !item.accessibilityId.toLowerCase().includes(accessibilityId.toLowerCase())) {
      return false
    }
    return true
  })

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
                <Label htmlFor="accessibilityName">장소명</Label>
                <Input
                  id="accessibilityName"
                  type="text"
                  placeholder="장소명 검색"
                  value={accessibilityName}
                  onChange={(e) => {
                    setAccessibilityName(e.target.value)
                    handleFilterChange()
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessibilityId">접근성 ID</Label>
                <Input
                  id="accessibilityId"
                  type="text"
                  placeholder="ID 검색"
                  value={accessibilityId}
                  onChange={(e) => {
                    setAccessibilityId(e.target.value)
                    handleFilterChange()
                  }}
                />
              </div>

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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">로딩 중...</p>
              </div>
            ) : (
              <InspectionResultTable
                columns={columns}
                data={filteredItems}
                expandedRows={expandedRows}
                loadedImages={loadedImages}
              />
            )}
          </CardContent>
        </Card>

        {filteredItems.length > 0 && (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <p className="text-sm text-muted-foreground font-medium">
                페이지 {currentPage} / {totalPages} (
                {filteredItems.length === items.length
                  ? `총 ${items.length}개`
                  : `${filteredItems.length}개 / 전체 ${items.length}개`}
                )
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

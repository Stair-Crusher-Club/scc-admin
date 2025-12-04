"use client"

import { useRef, useState } from "react"
import { RotateCcw, Upload } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { useAccessibilityInspectionResultsPaginated } from "@/lib/apis/api"
import {
  AccessibilityTypeDTO,
  InspectorTypeDTO,
  ResultTypeDTO,
  AdminAccessibilityInspectionResultDTO,
} from "@/lib/generated-sources/openapi"
import { z } from "zod"

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
import { Contents } from "@/components/layout"
import { api } from "@/lib/apis/api"
import { useToast } from "@/hooks/use-toast"

import { getColumns } from "./components/columns"
import { InspectionResultTable } from "./components/InspectionResultTable"

// 데이터 스키마 정의
export const inspectionResultSchema = z.object({
  id: z.string(),
  accessibilityId: z.string(),
  accessibilityType: z.string(),
  inspectorId: z.string(),
  inspectorType: z.string(),
  resultType: z.string(),
  contents: z.string(),
  images: z.array(z.any()),
  accessibilityName: z.string().nullable().optional(),
  handledAtMillis: z.number().nullable().optional(),
  createdAtMillis: z.number(),
  updatedAtMillis: z.number(),
})

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function AccessibilityInspectionResultPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string>("")
  const [accessibilityType, setAccessibilityType] = useState<AccessibilityTypeDTO | undefined>()
  const [inspectorType, setInspectorType] = useState<InspectorTypeDTO | undefined>()
  const [resultType, setResultType] = useState<ResultTypeDTO | undefined>()
  const [isHandled, setIsHandled] = useState<boolean | undefined>()
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [accessibilityName, setAccessibilityName] = useState<string>("")
  const [accessibilityId, setAccessibilityId] = useState<string>("")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setExpandedRows(new Set())
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize))
    setCurrentPage(1)
    setExpandedRows(new Set())
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    setExpandedRows(new Set())
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

  const handleBulkImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // File type validation
    if (!file.name.endsWith(".csv")) {
      toast({
        variant: "destructive",
        title: "파일 형식 오류",
        description: "CSV 파일만 업로드 가능합니다.",
      })
      return
    }

    // File size validation (10MB)
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "파일 크기 초과",
        description: "파일 크기는 10MB 이하여야 합니다.",
      })
      return
    }

    setIsUploading(true)
    setUploadMessage("")

    try {
      const response = await api.accessibility.bulkImportHumanInspections(file)

      const result = response.data
      let message = `업로드 완료\n`
      message += `전체 레코드: ${result.totalRecords}개\n`
      message += `파싱 성공: ${result.parsedCount}개\n`
      message += `파싱 실패: ${result.parseErrors}개\n`

      if (result.asyncProcessing) {
        message += `\n비동기 처리 시작됨 (100개 초과)`
        toast({
          title: "업로드 완료",
          description: "대량 데이터로 인해 백그라운드에서 처리됩니다.",
        })
      } else {
        message += `성공: ${result.successCount ?? 0}개\n`
        message += `실패: ${result.failureCount ?? 0}개`
        if (result.errors && result.errors.length > 0) {
          message += `\n\n에러 내용:\n${result.errors.slice(0, 5).join("\n")}`
          if (result.errors.length > 5) {
            message += `\n... 외 ${result.errors.length - 5}개`
          }
        }

        // Show success toast
        const hasErrors = result.failureCount && result.failureCount > 0
        if (hasErrors) {
          toast({
            title: "업로드 완료",
            description: `성공: ${result.successCount}개, 실패: ${result.failureCount}개`,
          })
        } else {
          toast({
            title: "업로드 성공",
            description: `${result.successCount}개의 레코드가 등록되었습니다.`,
          })
        }

        // Refresh data after successful upload
        queryClient.invalidateQueries({ queryKey: ["@accessibilityInspectionResultsPaginated"] })
      }

      setUploadMessage(message)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "업로드 중 오류가 발생했습니다."
      setUploadMessage(`오류: ${errorMessage}`)
      toast({
        variant: "destructive",
        title: "업로드 실패",
        description: errorMessage,
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const columns = getColumns()

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
              <Button
                variant="default"
                onClick={handleBulkImportClick}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "업로드 중..." : "CSV 일괄 등록"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </CardContent>
        </Card>

        {uploadMessage && (
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setUploadMessage("")}
              >
                ✕
              </Button>
              <pre className="text-sm whitespace-pre-wrap font-mono pr-8">{uploadMessage}</pre>
            </CardContent>
          </Card>
        )}

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
                onRowClick={toggleRowExpansion}
                enableRowSelection={true}
                enablePagination={false}
                pageSize={pageSize}
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
                  aria-label="Go to previous page"
                >
                  ← 이전
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  aria-label="Go to next page"
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

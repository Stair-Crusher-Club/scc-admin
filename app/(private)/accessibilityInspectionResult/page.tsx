"use client"

import { useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Filter, RotateCcw, Sparkles, Upload } from "lucide-react"
import { useRef, useState } from "react"

import { runImagePipeline, useAccessibilityInspectionResultsPaginated } from "@/lib/apis/api"
import { api, applyAccessibilityInspectionResults } from "@/lib/apis/api"
import {
  AccessibilityTypeDTO,
  ApplyFilterDtoInspectorTypeEnum,
  ApplyFilterDtoResultTypeEnum,
  InspectorTypeDTO,
  ResultTypeDTO,
} from "@/lib/generated-sources/openapi"

import { Contents } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

import { InspectionResultTable } from "./components/InspectionResultTable"
import { getColumns } from "./components/columns"

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
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isApplying, setIsApplying] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingSelectedIds, setPendingSelectedIds] = useState<string[]>([])
  const [showBulkInspectionDialog, setShowBulkInspectionDialog] = useState(false)
  const [bulkInspectionIds, setBulkInspectionIds] = useState("")
  const [bulkInspectionType, setBulkInspectionType] = useState<AccessibilityTypeDTO>(AccessibilityTypeDTO.Place)
  const [isRunningBulkInspection, setIsRunningBulkInspection] = useState(false)
  const [showCsvFormatDialog, setShowCsvFormatDialog] = useState(false)
  const [showBulkApplyByFilterDialog, setShowBulkApplyByFilterDialog] = useState(false)
  const [filterInspectorType, setFilterInspectorType] = useState<ApplyFilterDtoInspectorTypeEnum | undefined>()
  const [filterResultType, setFilterResultType] = useState<ApplyFilterDtoResultTypeEnum | undefined>()
  const [isApplyingByFilter, setIsApplyingByFilter] = useState(false)

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
    setShowCsvFormatDialog(true)
  }

  const handleCsvFileSelectClick = () => {
    setShowCsvFormatDialog(false)
    fileInputRef.current?.click()
  }

  // 선택된 항목들을 검수자 유형별로 그룹화하여 통계 계산
  const calculateStatistics = (ids: string[]) => {
    const selectedItems = items.filter((item) => ids.includes(item.id))

    const statsByInspectorType: Record<InspectorTypeDTO, { delete: number; modify: number; ok: number }> = {
      HUMAN: { delete: 0, modify: 0, ok: 0 },
      AI: { delete: 0, modify: 0, ok: 0 },
      UNKNOWN: { delete: 0, modify: 0, ok: 0 },
    }

    selectedItems.forEach((item) => {
      const inspectorType = item.inspectorType
      const resultType = item.resultType

      if (resultType === "DELETE") {
        statsByInspectorType[inspectorType].delete++
      } else if (resultType === "MODIFY") {
        statsByInspectorType[inspectorType].modify++
      } else if (resultType === "OK") {
        statsByInspectorType[inspectorType].ok++
      }
    })

    return statsByInspectorType
  }

  // 검수자 유형 라벨
  const getInspectorTypeLabel = (type: InspectorTypeDTO): string => {
    const labels: Record<InspectorTypeDTO, string> = {
      HUMAN: "인간",
      AI: "AI",
      UNKNOWN: "알 수 없음",
    }
    return labels[type] || type
  }

  const handleBulkApplyClick = () => {
    if (selectedIds.length === 0) {
      toast({
        variant: "destructive",
        title: "선택된 항목 없음",
        description: "일괄 반영할 항목을 선택해주세요.",
      })
      return
    }

    setPendingSelectedIds([...selectedIds])
    setShowConfirmDialog(true)
  }

  const handleBulkApplyConfirm = async () => {
    setShowConfirmDialog(false)

    setIsApplying(true)
    try {
      const response = await applyAccessibilityInspectionResults({
        inspectionResultIds: pendingSelectedIds,
      })

      const result = response.data
      const { totalProcessed, successCount, failureCount } = result.summary

      if (failureCount > 0) {
        toast({
          variant: "destructive",
          title: "일괄 반영 완료 (일부 실패)",
          description: `총 처리: ${totalProcessed}개\n성공: ${successCount}개, 실패: ${failureCount}개`,
        })
      } else {
        toast({
          title: "일괄 반영 성공",
          description: `${successCount}개의 검수 결과가 반영되었습니다.`,
        })
      }

      // Refresh data after successful apply
      queryClient.invalidateQueries({ queryKey: ["@accessibilityInspectionResultsPaginated"] })
      setSelectedIds([])
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "일괄 반영 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "일괄 반영 실패",
        description: errorMessage,
      })
    } finally {
      setIsApplying(false)
    }
  }

  // 확인 다이얼로그에 표시할 메시지 생성
  const getConfirmMessage = () => {
    if (pendingSelectedIds.length === 0) {
      return []
    }

    const statistics = calculateStatistics(pendingSelectedIds)
    const messages: string[] = []

    Object.entries(statistics).forEach(([inspectorType, stats]) => {
      const typeLabel = getInspectorTypeLabel(inspectorType as InspectorTypeDTO)
      const totalCount = stats.delete + stats.modify + stats.ok

      if (totalCount > 0) {
        const parts: string[] = []
        if (stats.delete > 0) {
          parts.push(`${stats.delete}개 삭제`)
        }
        if (stats.modify > 0) {
          parts.push(`${stats.modify}개 수정`)
        }
        if (stats.ok > 0) {
          parts.push(`${stats.ok}개 조치 불필요`)
        }

        if (parts.length > 0) {
          messages.push(`검수자 유형 ${typeLabel}의 검수 ${parts.join(", ")}됩니다`)
        }
      }
    })

    return messages
  }

  const handleBulkInspectionClick = () => {
    setShowBulkInspectionDialog(true)
  }

  const handleBulkInspectionConfirm = async () => {
    if (!bulkInspectionIds.trim()) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "접근성 ID를 입력해주세요.",
      })
      return
    }

    setIsRunningBulkInspection(true)

    try {
      const ids = bulkInspectionIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)

      if (ids.length === 0) {
        toast({
          variant: "destructive",
          title: "입력 오류",
          description: "유효한 접근성 ID를 입력해주세요.",
        })
        return
      }

      const items = ids.map((id) => ({
        accessibilityId: id,
        accessibilityType: bulkInspectionType,
      }))

      await runImagePipeline({ items })

      toast({
        title: "AI 검수 시작",
        description: `${ids.length}개의 접근성 데이터에 대한 AI 검수가 시작되었습니다.`,
      })

      setShowBulkInspectionDialog(false)
      setBulkInspectionIds("")
      setBulkInspectionType(AccessibilityTypeDTO.Place)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "AI 검수 실행 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "AI 검수 실패",
        description: errorMessage,
      })
    } finally {
      setIsRunningBulkInspection(false)
    }
  }

  const handleBulkApplyByFilterClick = () => {
    setShowBulkApplyByFilterDialog(true)
  }

  const handleBulkApplyByFilterConfirm = async () => {
    if (!filterInspectorType && !filterResultType) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "검수자 유형 또는 검수 결과 유형 중 하나 이상을 선택해주세요.",
      })
      return
    }

    setIsApplyingByFilter(true)

    try {
      const response = await applyAccessibilityInspectionResults({
        filter: {
          inspectorType: filterInspectorType,
          resultType: filterResultType,
        },
      })

      const result = response.data
      const { totalProcessed, successCount, failureCount } = result.summary

      if (failureCount > 0) {
        toast({
          variant: "destructive",
          title: "필터 기반 일괄 반영 완료 (일부 실패)",
          description: `총 처리: ${totalProcessed}개\n성공: ${successCount}개, 실패: ${failureCount}개`,
        })
      } else {
        toast({
          title: "필터 기반 일괄 반영 성공",
          description: `${successCount}개의 검수 결과가 반영되었습니다.`,
        })
      }

      setShowBulkApplyByFilterDialog(false)
      setFilterInspectorType(undefined)
      setFilterResultType(undefined)

      // Refresh data after successful apply
      queryClient.invalidateQueries({ queryKey: ["@accessibilityInspectionResultsPaginated"] })
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "필터 기반 일괄 반영 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "필터 기반 일괄 반영 실패",
        description: errorMessage,
      })
    } finally {
      setIsApplyingByFilter(false)
    }
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
              <Button variant="default" onClick={handleBulkImportClick} disabled={isUploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {isUploading ? "업로드 중..." : "CSV 일괄 등록"}
              </Button>
              <Button
                variant="default"
                onClick={handleBulkApplyClick}
                disabled={isApplying || selectedIds.length === 0}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isApplying ? "반영 중..." : `선택 항목 일괄 반영 (${selectedIds.length}개)`}
              </Button>
              <Button variant="default" onClick={handleBulkInspectionClick} className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI 일괄 검수
              </Button>
              <Button
                variant="default"
                onClick={handleBulkApplyByFilterClick}
                disabled={isApplyingByFilter}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {isApplyingByFilter ? "반영 중..." : "필터 기반 일괄 반영"}
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
              <Button variant="ghost" size="sm" className="absolute top-2 right-2" onClick={() => setUploadMessage("")}>
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
                onSelectionChange={setSelectedIds}
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

        {/* 확인 다이얼로그 */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>일괄 반영 확인</DialogTitle>
              <DialogDescription>아래 내용을 확인하고 반영 여부를 결정해주세요.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {getConfirmMessage().map((message, index) => (
                <p key={index} className="mb-2 text-sm">
                  {message}
                </p>
              ))}
              {getConfirmMessage().length === 0 && (
                <p className="text-sm text-muted-foreground">선택된 항목이 없습니다.</p>
              )}
              {getConfirmMessage().length > 0 && <p className="mt-4 text-sm font-medium">반영하시겠습니까?</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                취소
              </Button>
              <Button onClick={handleBulkApplyConfirm}>반영하기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI 일괄 검수 다이얼로그 */}
        <Dialog open={showBulkInspectionDialog} onOpenChange={setShowBulkInspectionDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>AI 일괄 검수</DialogTitle>
              <DialogDescription>접근성 ID를 쉼표로 구분하여 입력하고 검수 유형을 선택해주세요.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulkInspectionIds">접근성 ID (쉼표로 구분)</Label>
                <Textarea
                  id="bulkInspectionIds"
                  placeholder="예: id1, id2, id3"
                  value={bulkInspectionIds}
                  onChange={(e) => setBulkInspectionIds(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  여러 ID를 쉼표(,)로 구분하여 입력하세요. 공백은 자동으로 제거됩니다.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulkInspectionType">접근성 유형</Label>
                <Select
                  value={bulkInspectionType}
                  onValueChange={(value) => setBulkInspectionType(value as AccessibilityTypeDTO)}
                >
                  <SelectTrigger id="bulkInspectionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Place">Place</SelectItem>
                    <SelectItem value="Building">Building</SelectItem>
                    <SelectItem value="PlaceReview">PlaceReview</SelectItem>
                    <SelectItem value="ToiletReview">ToiletReview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkInspectionDialog(false)
                  setBulkInspectionIds("")
                  setBulkInspectionType(AccessibilityTypeDTO.Place)
                }}
                disabled={isRunningBulkInspection}
              >
                취소
              </Button>
              <Button onClick={handleBulkInspectionConfirm} disabled={isRunningBulkInspection} className="gap-2">
                <Sparkles className="h-4 w-4" />
                {isRunningBulkInspection ? "검수 시작 중..." : "AI 검수 시작"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CSV 형식 안내 다이얼로그 */}
        <Dialog open={showCsvFormatDialog} onOpenChange={setShowCsvFormatDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>CSV 일괄 등록 형식 안내</DialogTitle>
              <DialogDescription>아래 형식에 맞춰 CSV 파일을 준비해주세요.</DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-4">
              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">기본 요구사항</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ul className="list-disc pl-5 text-xs space-y-0.5">
                      <li>총 30개 컬럼으로 구성된 CSV 파일</li>
                      <li>첫 번째 행은 헤더 행 (컬럼명) 포함</li>
                      <li>인코딩: UTF-8</li>
                      <li>최대 파일 크기: 10MB</li>
                      <li>100개 이하: 동기 처리, 100개 초과: 비동기 처리</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">필수 컬럼 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs pt-2">
                    <div>
                      <span className="font-semibold">컬럼 1 (장소 id):</span> 검수 대상 장소의 고유 ID
                    </div>
                    <Separator />
                    <div>
                      <span className="font-semibold">컬럼 10 (코멘트):</span> 검수 시 작성된 원본 코멘트
                    </div>
                    <Separator />
                    <div>
                      <div className="font-semibold mb-1">컬럼 16 (판정): 검수 결과 판정</div>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Badge variant="secondary" className="text-xs">정상</Badge>
                        <Badge variant="destructive" className="text-xs">삭제 대상</Badge>
                        <Badge variant="outline" className="text-xs">수정 대상</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <span className="font-semibold">컬럼 17 (추가 의견):</span>{" "}
                      <Badge variant="outline" className="ml-1">
                        선택
                      </Badge>{" "}
                      검수자의 추가 의견
                    </div>
                    <Separator />
                    <div>
                      <div className="font-semibold mb-1">컬럼 21-26 (수정 요청 정보): 수정 대상인 경우 입력</div>
                      <div className="text-xs space-y-0.5 pl-3">
                        <div>• 컬럼 21: 1층 여부 (TRUE/FALSE)</div>
                        <div>• 컬럼 22: 층 수</div>
                        <div>• 컬럼 23: 계단 개수 (NONE, ONE, TWO_TO_FIVE, OVER_SIX)</div>
                        <div>• 컬럼 24: 계단 높이 (HALF_THUMB, THUMB, OVER_THUMB)</div>
                        <div>• 컬럼 25: 경사로 유무 (TRUE/FALSE)</div>
                        <div>• 컬럼 26: 문 유형 (None, Hinged, Sliding, Revolving, Automatic, ETC)</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <span className="font-semibold">컬럼 30 (검수자):</span> 검수를 수행한 사람의 이름
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">전체 컬럼 목록 (30개)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <pre className="text-[10px] leading-tight whitespace-pre-wrap font-mono bg-muted p-2 rounded-md">
                      {`장소 id, 장소 이름, 정복 시점, 1층 여부, 층 수, 계단 개수,
계단 높이 (1칸인 경우), 경사로 유무, 문 유형, 코멘트, 이미지,
정복자, 사진 1, 사진 2, 사진 3, 판정, (선택) 추가 의견,
사진 1, 사진 2, 사진 3, 1층 여부, 층 수, 계단 개수,
계단 높이 (1칸인 경우), 경사로 유무, 문 유형, 사진 1,
사진 2, 사진 3, 검수자`}
                    </pre>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-900">참고사항</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ul className="list-disc pl-5 text-xs text-blue-800 space-y-0.5">
                      <li>빈 컬럼은 빈 문자열로 유지</li>
                      <li>이미지 URL은 쉼표로 구분하여 입력</li>
                      <li>파싱 실패한 레코드는 자동으로 제외됩니다</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter className="flex-shrink-0">
              <Button variant="outline" onClick={() => setShowCsvFormatDialog(false)}>
                취소
              </Button>
              <Button onClick={handleCsvFileSelectClick} className="gap-2">
                <Upload className="h-4 w-4" />
                파일 선택
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 필터 기반 일괄 반영 다이얼로그 */}
        <Dialog open={showBulkApplyByFilterDialog} onOpenChange={setShowBulkApplyByFilterDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>필터 기반 일괄 반영</DialogTitle>
              <DialogDescription>
                검수자 유형 또는 검수 결과 유형을 선택하여 조건에 맞는 모든 미처리 검수 결과를 일괄 반영합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filterInspectorType">검수자 유형 (선택)</Label>
                <Select
                  value={filterInspectorType ?? "none"}
                  onValueChange={(value) =>
                    setFilterInspectorType(
                      value === "none" ? undefined : (value as ApplyFilterDtoInspectorTypeEnum)
                    )
                  }
                >
                  <SelectTrigger id="filterInspectorType">
                    <SelectValue placeholder="선택하지 않음" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택하지 않음</SelectItem>
                    <SelectItem value={ApplyFilterDtoInspectorTypeEnum.Ai}>AI</SelectItem>
                    <SelectItem value={ApplyFilterDtoInspectorTypeEnum.User}>USER</SelectItem>
                    <SelectItem value={ApplyFilterDtoInspectorTypeEnum.Bulk}>BULK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterResultType">검수 결과 유형 (선택)</Label>
                <Select
                  value={filterResultType ?? "none"}
                  onValueChange={(value) =>
                    setFilterResultType(value === "none" ? undefined : (value as ApplyFilterDtoResultTypeEnum))
                  }
                >
                  <SelectTrigger id="filterResultType">
                    <SelectValue placeholder="선택하지 않음" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">선택하지 않음</SelectItem>
                    <SelectItem value={ApplyFilterDtoResultTypeEnum.Ok}>OK</SelectItem>
                    <SelectItem value={ApplyFilterDtoResultTypeEnum.Modify}>MODIFY</SelectItem>
                    <SelectItem value={ApplyFilterDtoResultTypeEnum.Delete}>DELETE</SelectItem>
                    <SelectItem value={ApplyFilterDtoResultTypeEnum.Unknown}>UNKNOWN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                <strong>주의:</strong> 이 작업은 선택한 조건에 맞는 모든 미처리 검수 결과를 반영합니다. 신중하게
                사용하세요.
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkApplyByFilterDialog(false)
                  setFilterInspectorType(undefined)
                  setFilterResultType(undefined)
                }}
                disabled={isApplyingByFilter}
              >
                취소
              </Button>
              <Button onClick={handleBulkApplyByFilterConfirm} disabled={isApplyingByFilter} className="gap-2">
                <Filter className="h-4 w-4" />
                {isApplyingByFilter ? "반영 중..." : "일괄 반영"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Contents.Normal>
    </>
  )
}

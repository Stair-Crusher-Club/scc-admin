"use client"

import { ColumnFiltersState } from "@tanstack/react-table"
import { format } from "date-fns"
import { Search, Sparkles } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { SearchAccessibilitiesPayload, runImagePipeline } from "@/lib/apis/api"
import { AccessibilityTypeDTO } from "@/lib/generated-sources/openapi"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Contents } from "@/components/layout"
import { DataTable } from "@/components/ui/data-table"
import { useToast } from "@/hooks/use-toast"

import { getColumns } from "./components/columns"
import { useAccessibilities } from "./query"
import { AccessibilityDetailRow } from "./components/AccessibilityDetailRow"

export default function AccessibilityList() {
  const { toast } = useToast()
  const form = useForm<SearchAccessibilitiesPayload>()
  const [formInput, setFormInput] = useState<SearchAccessibilitiesPayload>({
    placeName: "",
    createdAtFromLocalDate: "",
    createdAtToLocalDate: "",
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [showBulkInspectionDialog, setShowBulkInspectionDialog] = useState(false)
  const [bulkInspectionIds, setBulkInspectionIds] = useState("")
  const [bulkInspectionType, setBulkInspectionType] = useState<AccessibilityTypeDTO>(AccessibilityTypeDTO.Place)
  const [isRunningBulkInspection, setIsRunningBulkInspection] = useState(false)
  const { data, fetchNextPage, hasNextPage } = useAccessibilities(formInput)
  const accessibilities = data?.pages.flatMap((p) => p.items) ?? []

  const updateFormInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const placeName = formData.get("placeName") as string
    const registeredUserName = formData.get("registeredUserName") as string
    const createdAtFrom = formData.get("createdAtFromLocalDate") as string
    const createdAtTo = formData.get("createdAtToLocalDate") as string

    setFormInput({
      placeName: placeName || "",
      createdAtFromLocalDate: createdAtFrom
        ? format(new Date(createdAtFrom), "yyyy-MM-dd")
        : "",
      createdAtToLocalDate: createdAtTo
        ? format(new Date(createdAtTo), "yyyy-MM-dd")
        : "",
    })

    const filters: ColumnFiltersState = []
    if (placeName) {
      filters.push({ id: "placeAccessibility.placeName", value: placeName })
    }
    if (registeredUserName) {
      filters.push({ id: "placeAccessibility.registeredUserName", value: registeredUserName })
    }
    setColumnFilters(filters)
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

  const columns = getColumns(formInput)

  return (
    <>
      <Contents.Normal>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>검색 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <form id="search-accessibilities" onSubmit={updateFormInput}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="placeName">장소명</Label>
                    <Input
                      id="placeName"
                      name="placeName"
                      type="text"
                      placeholder="장소명으로 필터링"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="registeredUserName">촬영자</Label>
                    <Input
                      id="registeredUserName"
                      name="registeredUserName"
                      type="text"
                      placeholder="촬영자 이름으로 필터링"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="createdAtFromLocalDate">정보 등록 시작일</Label>
                    <Input
                      id="createdAtFromLocalDate"
                      name="createdAtFromLocalDate"
                      type="date"
                      defaultValue={formInput.createdAtFromLocalDate}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="createdAtToLocalDate">정보 등록 종료일</Label>
                    <Input
                      id="createdAtToLocalDate"
                      name="createdAtToLocalDate"
                      type="date"
                      defaultValue={formInput.createdAtToLocalDate}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleBulkInspectionClick} className="gap-2" type="button">
                    <Sparkles className="h-4 w-4" />
                    AI 일괄 검수
                  </Button>
                  <Button type="submit" className="gap-2">
                    <Search className="h-4 w-4" />
                    검색
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={accessibilities}
              onLoadMore={() => fetchNextPage()}
              hasMore={hasNextPage}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              renderExpandedRow={(row) => <AccessibilityDetailRow accessibility={row} />}
            />
          </CardContent>
        </Card>

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
      </Contents.Normal>
    </>
  )
}

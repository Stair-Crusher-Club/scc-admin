"use client"

import { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"
import { RotateCcw, Search } from "lucide-react"
import { useState } from "react"

import { AdminPlaceAccessibilitySuggestionDto, SuggestionStatusDto } from "@/lib/generated-sources/openapi"

import { Contents } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"

import { SuggestionDetailContent } from "./SuggestionDetailContent"
import { statusLabels, useBulkConfirmSuggestions, useSuggestions } from "./query"

function getStatusBadgeVariant(status: SuggestionStatusDto): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case SuggestionStatusDto.Pending:
      return "outline"
    case SuggestionStatusDto.Confirmed:
      return "default"
    case SuggestionStatusDto.Rejected:
      return "destructive"
    default:
      return "secondary"
  }
}

export default function AccessibilitySuggestionListPage() {
  const { toast } = useToast()

  const [filterStatus, setFilterStatus] = useState<SuggestionStatusDto | undefined>()
  const [placeNameFilter, setPlaceNameFilter] = useState("")

  const { data, fetchNextPage, hasNextPage, isLoading } = useSuggestions({
    status: filterStatus,
  })
  const bulkConfirm = useBulkConfirmSuggestions()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null)

  const allItems: AdminPlaceAccessibilitySuggestionDto[] = data?.pages.flatMap((p) => p.items) ?? []

  // Client-side placeName filtering (API doesn't support it)
  const items = placeNameFilter
    ? allItems.filter((item) => item.placeName.toLowerCase().includes(placeNameFilter.toLowerCase()))
    : allItems

  const pendingItems = items.filter((item) => item.status === SuggestionStatusDto.Pending)

  const handleReset = () => {
    setFilterStatus(undefined)
    setPlaceNameFilter("")
    setSelectedIds(new Set())
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === pendingItems.length && pendingItems.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(pendingItems.map((item) => item.id)))
    }
  }

  const handleBulkConfirm = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (!window.confirm(`${ids.length}건의 제안을 일괄 확인하시겠습니까?`)) return

    try {
      await bulkConfirm.mutateAsync(ids)
      toast({
        title: "일괄 확인 완료",
        description: `${ids.length}건의 제안이 확인되었습니다.`,
      })
      setSelectedIds(new Set())
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "일괄 확인 중 오류가 발생했습니다."
      toast({
        variant: "destructive",
        title: "일괄 확인 실패",
        description: errorMessage,
      })
    }
  }

  const columns: ColumnDef<AdminPlaceAccessibilitySuggestionDto>[] = [
    {
      id: "select",
      header: () => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={pendingItems.length > 0 && selectedIds.size === pendingItems.length}
            onCheckedChange={toggleSelectAll}
            aria-label="전체 선택"
          />
        </div>
      ),
      cell: ({ row }) => {
        const isPending = row.original.status === SuggestionStatusDto.Pending
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={selectedIds.has(row.original.id)}
              onCheckedChange={() => toggleSelect(row.original.id)}
              disabled={!isPending}
              aria-label="선택"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "placeName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="장소명" />,
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate" title={row.original.placeName}>
          {row.original.placeName}
        </div>
      ),
    },
    {
      accessorKey: "addressFromCrawl",
      header: ({ column }) => <DataTableColumnHeader column={column} title="주소" />,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[200px] truncate" title={row.original.addressFromCrawl ?? ""}>
          {row.original.addressFromCrawl ?? "-"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "categoryFromCrawl",
      header: ({ column }) => <DataTableColumnHeader column={column} title="카테고리" />,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground max-w-[150px] truncate" title={row.original.categoryFromCrawl ?? ""}>
          {row.original.categoryFromCrawl ?? "-"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "aiConfidence",
      header: ({ column }) => <DataTableColumnHeader column={column} title="AI 신뢰도" />,
      cell: ({ row }) => (
        <div className="text-center text-sm">
          {row.original.aiConfidence ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="상태" />,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant={getStatusBadgeVariant(row.original.status)}>
            {statusLabels[row.original.status]}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "createdAtMillis",
      header: ({ column }) => <DataTableColumnHeader column={column} title="생성일" />,
      cell: ({ row }) => (
        <div className="text-center text-sm text-muted-foreground whitespace-nowrap">
          {dayjs(row.original.createdAtMillis).format("YYYY-MM-DD HH:mm")}
        </div>
      ),
    },
  ]

  return (
    <Contents.Normal>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>접근성 제안 관리</CardTitle>
          <CardDescription>
            AI가 크롤링한 사진을 분석하여 생성한 접근성 정보 제안을 검토하고 확인/반려합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>상태</Label>
              <Select
                value={filterStatus ?? "all"}
                onValueChange={(value) => {
                  setFilterStatus(value === "all" ? undefined : (value as SuggestionStatusDto))
                  setSelectedIds(new Set())
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value={SuggestionStatusDto.Pending}>대기</SelectItem>
                  <SelectItem value={SuggestionStatusDto.Confirmed}>확인</SelectItem>
                  <SelectItem value={SuggestionStatusDto.Rejected}>반려</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>장소명 검색</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="장소명 입력..."
                  value={placeNameFilter}
                  onChange={(e) => setPlaceNameFilter(e.target.value)}
                />
                <Button variant="outline" aria-label="검색">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                초기화
              </Button>
              {selectedIds.size > 0 && (
                <Button
                  onClick={handleBulkConfirm}
                  disabled={bulkConfirm.isPending}
                  className="gap-2"
                >
                  {bulkConfirm.isPending ? "처리 중..." : `일괄 확인 (${selectedIds.size}건)`}
                </Button>
              )}
            </div>
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
            <DataTable
              columns={columns}
              data={items}
              hasMore={hasNextPage}
              onLoadMore={() => fetchNextPage()}
              onRowClick={(row) => setSelectedSuggestionId(row.id)}
            />
          )}
        </CardContent>
      </Card>

      {items.length > 0 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          총 {items.length}개 항목
        </div>
      )}

      {/* Detail Sheet Panel */}
      <Sheet open={selectedSuggestionId !== null} onOpenChange={(open) => { if (!open) setSelectedSuggestionId(null) }}>
        <SheetContent
          side="right"
          className="w-[65vw] max-w-[65vw] sm:max-w-[65vw] overflow-y-auto overflow-x-hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>접근성 제안 상세</SheetTitle>
            <SheetDescription>선택한 접근성 제안의 상세 정보입니다.</SheetDescription>
          </SheetHeader>
          {selectedSuggestionId && (
            <SuggestionDetailContent
              key={selectedSuggestionId}
              id={selectedSuggestionId}
              onClose={() => setSelectedSuggestionId(null)}
              onDeleted={() => setSelectedSuggestionId(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </Contents.Normal>
  )
}

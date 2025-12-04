"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { format as formatDate } from "date-fns"
import { useState } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ColumnsIcon,
} from "lucide-react"

import { AdminAccessibilityInspectionResultDTO } from "@/lib/generated-sources/openapi"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import RemoteImage from "@/components/RemoteImage"

// AI Inspection Detail Component
function AIInspectionDetail({
  result,
  images,
  item,
}: {
  result: any
  images: any[]
  item: AdminAccessibilityInspectionResultDTO
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">상세 검수 결과 (AI)</h3>

      <div>
        <Label className="text-sm font-semibold mb-2 block">설명</Label>
        <p className="text-sm">{result?.description || "설명 없음"}</p>
      </div>

      {images.length > 0 && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">전체 이미지</Label>
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
        </div>
      )}

      <div>
        <Label className="text-sm font-semibold mb-2 block">전체 코드</Label>
        <div className="flex flex-wrap gap-2">
          {result?.overallCodes?.length > 0 ? (
            result.overallCodes.map((code: string, idx: number) => (
              <Badge key={idx} variant="secondary">
                {code}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">코드 없음</span>
          )}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 block">이미지별 상세</Label>
        <div className="space-y-3">
          {result?.images?.length > 0 ? (
            result.images.map((imgDetail: any, idx: number) => (
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
            ))
          ) : (
            <span className="text-sm text-muted-foreground">상세 정보 없음</span>
          )}
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
  )
}

// Human Inspection Detail Component
function HumanInspectionDetail({
  result,
  images,
  item,
}: {
  result: any
  images: any[]
  item: AdminAccessibilityInspectionResultDTO
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">상세 검수 결과 (HUMAN)</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold mb-2 block">검수 상태</Label>
          <Badge variant="default" className="text-base px-3 py-1">
            {result?.status || "UNKNOWN"}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 block">코멘트</Label>
        <p className="text-sm bg-background border rounded-lg p-4">
          {result?.comment || "코멘트 없음"}
        </p>
      </div>

      <div>
        <Label className="text-sm font-semibold mb-2 block">사유</Label>
        <p className="text-sm bg-background border rounded-lg p-4">
          {result?.reason || "사유 없음"}
        </p>
      </div>

      {images.length > 0 && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">전체 이미지</Label>
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
        </div>
      )}

      {result?.imageReasons && result.imageReasons.length > 0 && (
        <div>
          <Label className="text-sm font-semibold mb-2 block">이미지별 사유</Label>
          <div className="space-y-3">
            {result.imageReasons.map((imgReason: any, idx: number) => (
              <div key={idx} className="bg-background border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0">
                    이미지 #{imgReason.imageIndex}
                  </Badge>
                  <div className="flex-1">
                    {imgReason.imageUrl && (
                      <p className="text-xs font-mono text-muted-foreground mb-2 break-all">
                        {imgReason.imageUrl}
                      </p>
                    )}
                    <p className="text-sm">{imgReason.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.modificationRequest && (
        <div>
          <Label className="text-sm font-semibold mb-2 block">수정 요청 사항</Label>
          <div className="bg-background border rounded-lg p-4 space-y-3">
            {result.modificationRequest.isFirstFloor !== null &&
              result.modificationRequest.isFirstFloor !== undefined && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">1층 여부:</span>
                  <span className="text-sm col-span-2">
                    {result.modificationRequest.isFirstFloor ? "예" : "아니오"}
                  </span>
                </div>
              )}

            {result.modificationRequest.floors && result.modificationRequest.floors.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">층수:</span>
                <span className="text-sm col-span-2">
                  {result.modificationRequest.floors.join(", ")}층
                </span>
              </div>
            )}

            {result.modificationRequest.stairInfo && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">계단 정보:</span>
                <span className="text-sm col-span-2">
                  {result.modificationRequest.stairInfo}
                </span>
              </div>
            )}

            {result.modificationRequest.stairHeightLevel && (
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">계단 높이:</span>
                <span className="text-sm col-span-2">
                  {result.modificationRequest.stairHeightLevel}
                </span>
              </div>
            )}

            {result.modificationRequest.hasSlope !== null &&
              result.modificationRequest.hasSlope !== undefined && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">경사로 유무:</span>
                  <span className="text-sm col-span-2">
                    {result.modificationRequest.hasSlope ? "있음" : "없음"}
                  </span>
                </div>
              )}

            {result.modificationRequest.entranceDoorTypes &&
              result.modificationRequest.entranceDoorTypes.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium text-muted-foreground">출입문 유형:</span>
                  <span className="text-sm col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {result.modificationRequest.entranceDoorTypes.map((type: string, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </span>
                </div>
              )}

            {!result.modificationRequest.isFirstFloor &&
              !result.modificationRequest.floors &&
              !result.modificationRequest.stairInfo &&
              !result.modificationRequest.stairHeightLevel &&
              result.modificationRequest.hasSlope === null &&
              !result.modificationRequest.entranceDoorTypes && (
                <span className="text-sm text-muted-foreground">수정 요청 없음</span>
              )}
          </div>
        </div>
      )}

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
  )
}

interface InspectionResultTableProps {
  columns: ColumnDef<AdminAccessibilityInspectionResultDTO>[]
  data: AdminAccessibilityInspectionResultDTO[]
  expandedRows: Set<string>
  onRowClick: (itemId: string) => void
  enableRowSelection?: boolean
  enablePagination?: boolean
  pageSize?: number
}

export function InspectionResultTable({
  columns,
  data,
  expandedRows,
  onRowClick,
  enableRowSelection = false,
  enablePagination = false,
  pageSize: initialPageSize = 20,
}: InspectionResultTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  // Add select column if row selection is enabled
  const columnsWithSelection = enableRowSelection
    ? [
        {
          id: "select",
          header: ({ table }: any) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
              />
            </div>
          ),
          cell: ({ row }: any) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
              />
            </div>
          ),
          enableSorting: false,
          enableHiding: false,
        },
        ...columns,
      ]
    : columns

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection: enableRowSelection,
    getRowId: (row) => row.id,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: enablePagination ? pagination : undefined,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {enableRowSelection && (
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <ColumnsIcon className="h-4 w-4" />
                <span className="hidden lg:inline">컬럼 설정</span>
                <span className="lg:hidden">컬럼</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted()
                    return (
                      <TableHead
                        key={header.id}
                        className={isSorted ? "bg-primary/5" : ""}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const isExpanded = expandedRows.has(row.original.id)
                  const images = row.original.images ?? []

                  let imageInspectionResult = null
                  try {
                    if (row.original.contents) {
                      imageInspectionResult = JSON.parse(row.original.contents)
                    }
                  } catch (e) {
                    console.error("Failed to parse inspection result contents", e)
                  }

                  return (
                    <>
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-pointer hover:bg-muted/50 data-[state=selected]:bg-muted/50"
                        onClick={() => onRowClick(row.original.id)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${row.id}-expanded`}>
                          <TableCell
                            colSpan={columnsWithSelection.length}
                            className="bg-muted/30 p-6"
                          >
                            {row.original.inspectorType === "HUMAN" ? (
                              <HumanInspectionDetail
                                result={imageInspectionResult}
                                images={images}
                                item={row.original}
                              />
                            ) : (
                              <AIInspectionDetail
                                result={imageInspectionResult}
                                images={images}
                                item={row.original}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columnsWithSelection.length}
                    className="h-24 text-center"
                  >
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {enablePagination && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {enableRowSelection &&
              `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`}
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit lg:ml-auto">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                페이지당 행 수
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to first page"
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to previous page"
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Go to next page"
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                aria-label="Go to last page"
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

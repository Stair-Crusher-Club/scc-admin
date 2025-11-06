"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { format as formatDate } from "date-fns"
import { useState } from "react"

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
import { Label } from "@/components/ui/label"
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
}

export function InspectionResultTable({
  columns,
  data,
  expandedRows,
}: InspectionResultTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
                    <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
                      {row.getVisibleCells().map((cell) => {
                        const isSorted = cell.column.getIsSorted()
                        return (
                          <TableCell
                            key={cell.id}
                            className={isSorted ? "bg-primary/5" : ""}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                    {isExpanded && (
                      <TableRow key={`${row.id}-expanded`}>
                        <TableCell colSpan={columns.length} className="bg-muted/30 p-6">
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
                  colSpan={columns.length}
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
  )
}

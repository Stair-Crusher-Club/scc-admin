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

interface InspectionResultTableProps {
  columns: ColumnDef<AdminAccessibilityInspectionResultDTO>[]
  data: AdminAccessibilityInspectionResultDTO[]
  expandedRows: Set<string>
  loadedImages: Set<string>
}

export function InspectionResultTable({
  columns,
  data,
  expandedRows,
  loadedImages,
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
                  return (
                    <TableHead key={header.id}>
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
                const imagesLoaded = loadedImages.has(row.original.id)
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
                        <TableCell colSpan={columns.length} className="bg-muted/30 p-6">
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold border-b pb-2">상세 검수 결과</h3>

                            <div>
                              <Label className="text-sm font-semibold mb-2 block">설명</Label>
                              <p className="text-sm">{imageInspectionResult?.description || "설명 없음"}</p>
                            </div>

                            {imagesLoaded && images.length > 0 && (
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
                                {imageInspectionResult?.overallCodes?.length > 0 ? (
                                  imageInspectionResult.overallCodes.map((code: string, idx: number) => (
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
                                {imageInspectionResult?.images?.length > 0 ? (
                                  imageInspectionResult.images.map((imgDetail: any, idx: number) => (
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
                                  {formatDate(new Date(row.original.createdAtMillis), "yyyy-MM-dd HH:mm:ss")}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold mb-1 block">수정일</Label>
                                <p className="text-sm font-mono text-muted-foreground">
                                  {formatDate(new Date(row.original.updatedAtMillis), "yyyy-MM-dd HH:mm:ss")}
                                </p>
                              </div>
                            </div>
                          </div>
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

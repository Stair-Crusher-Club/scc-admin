"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format as formatDate } from "date-fns"
import { ChevronDown, ChevronUp } from "lucide-react"

import {
  AdminAccessibilityInspectionResultDTO,
  AccessibilityTypeDTO,
  ResultTypeDTO,
} from "@/lib/generated-sources/openapi"

import { DataTableColumnHeader } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import RemoteImage from "@/components/RemoteImage"

interface ColumnContext {
  expandedRows: Set<string>
  loadedImages: Set<string>
  toggleRowExpansion: (itemId: string) => void
  loadImages: (itemId: string) => void
}

export function getColumns(context: ColumnContext): ColumnDef<AdminAccessibilityInspectionResultDTO>[] {
  return [
    {
      accessorKey: "accessibilityName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="장소명" />
      ),
      cell: ({ row }) => {
        const name = row.original.accessibilityName || "이름 없음"
        return (
          <div className="font-medium max-w-[200px] truncate" title={name}>
            {name}
          </div>
        )
      },
      enableSorting: true,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "accessibilityId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="접근성 ID" />
      ),
      cell: ({ row }) => {
        const id = row.original.accessibilityId
        return (
          <div className="font-mono text-xs max-w-[150px] truncate" title={id}>
            {id}
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "accessibilityType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="유형" />
      ),
      cell: ({ row }) => {
        const type = row.original.accessibilityType
        const typeColors: Record<AccessibilityTypeDTO, string> = {
          Place: "bg-blue-100 text-blue-800",
          Building: "bg-green-100 text-green-800",
          PlaceReview: "bg-purple-100 text-purple-800",
          ToiletReview: "bg-orange-100 text-orange-800",
          UNKNOWN: "bg-gray-100 text-gray-800",
        }
        return (
          <Badge variant="secondary" className={typeColors[type]}>
            {type}
          </Badge>
        )
      },
      enableSorting: true,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "resultType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="결과" />
      ),
      cell: ({ row }) => {
        const result = row.original.resultType
        const variantMap: Record<ResultTypeDTO, "default" | "destructive" | "secondary"> = {
          OK: "default",
          MODIFY: "secondary",
          DELETE: "destructive",
          UNKNOWN: "secondary",
        }
        return <Badge variant={variantMap[result]}>{result}</Badge>
      },
      enableSorting: true,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "inspectorType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="검수자" />
      ),
      cell: ({ row }) => {
        const inspectorType = row.original.inspectorType
        return (
          <Badge variant={inspectorType === "HUMAN" ? "default" : "secondary"}>
            {inspectorType}
          </Badge>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "createdAtMillis",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="생성일" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAtMillis)
        return (
          <div className="text-sm whitespace-nowrap">
            {formatDate(date, "yyyy/M/d HH:mm")}
          </div>
        )
      },
      enableSorting: true,
      sortingFn: "basic",
    },
    {
      accessorKey: "images",
      header: () => <div className="text-center font-semibold">이미지</div>,
      cell: ({ row }) => {
        const images = row.original.images ?? []
        const isLoaded = context.loadedImages.has(row.original.id)

        if (images.length === 0) {
          return <span className="text-xs text-muted-foreground">없음</span>
        }

        if (!isLoaded) {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                context.loadImages(row.original.id)
              }}
            >
              로드 ({images.length})
            </Button>
          )
        }

        return (
          <div className="flex gap-1">
            {images.slice(0, 3).map((img: any, idx: number) => (
              <div key={idx} className="w-12 h-12 rounded border overflow-hidden">
                <RemoteImage
                  src={img.thumbnailUrl ?? img.imageUrl}
                  width={48}
                  height={48}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
            ))}
            {images.length > 3 && (
              <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center text-xs">
                +{images.length - 3}
              </div>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <div className="text-center font-semibold">상세</div>,
      cell: ({ row }) => {
        const isExpanded = context.expandedRows.has(row.original.id)
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              context.toggleRowExpansion(row.original.id)
            }}
            className="gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                접기
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                보기
              </>
            )}
          </Button>
        )
      },
      enableSorting: false,
    },
  ]
}

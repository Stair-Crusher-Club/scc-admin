"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format as formatDate } from "date-fns"

import {
  AdminAccessibilityInspectionResultDTO,
  AccessibilityTypeDTO,
} from "@/lib/generated-sources/openapi"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { ResultTypeBadge, InspectorTypeBadge } from "./Badges"

export function getColumns(): ColumnDef<AdminAccessibilityInspectionResultDTO>[] {
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
      sortingFn: "alphanumeric",
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
          <div className="w-fit">
            <Badge variant="secondary" className={`${typeColors[type]} w-fit`}>
              {type}
            </Badge>
          </div>
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
        return (
          <div className="w-fit">
            <ResultTypeBadge resultType={row.original.resultType} />
          </div>
        )
      },
      enableSorting: true,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "inspectorType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="검수자 유형" />
      ),
      cell: ({ row }) => {
        return (
          <div className="w-fit">
            <InspectorTypeBadge inspectorType={row.original.inspectorType} />
          </div>
        )
      },
      enableSorting: true,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "inspectorId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="검수자 ID" />
      ),
      cell: ({ row }) => {
        const inspectorId = row.original.inspectorId
        return (
          <div className="font-mono text-xs max-w-[150px] truncate" title={inspectorId}>
            {inspectorId || "-"}
          </div>
        )
      },
      enableSorting: true,
      sortingFn: "alphanumeric",
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
  ]
}

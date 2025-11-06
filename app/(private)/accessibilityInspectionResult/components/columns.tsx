"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format as formatDate } from "date-fns"

import {
  AdminAccessibilityInspectionResultDTO,
  AccessibilityTypeDTO,
  ResultTypeDTO,
} from "@/lib/generated-sources/openapi"

import { DataTableColumnHeader } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"

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
        <DataTableColumnHeader column={column} title="검수자 유형" />
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

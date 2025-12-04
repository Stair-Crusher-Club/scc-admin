"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format as formatDate } from "date-fns"
import {
  CheckCircle2Icon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
  SparklesIcon,
  HelpCircleIcon,
} from "lucide-react"

import {
  AdminAccessibilityInspectionResultDTO,
  AccessibilityTypeDTO,
  ResultTypeDTO,
  InspectorTypeDTO,
} from "@/lib/generated-sources/openapi"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table"

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
        const result = row.original.resultType
        const getResultIcon = (resultType: ResultTypeDTO) => {
          switch (resultType) {
            case "OK":
              return (
                <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
              )
            case "MODIFY":
              return <PencilIcon className="text-blue-500 dark:text-blue-400" />
            case "DELETE":
              return <Trash2Icon className="text-red-500 dark:text-red-400" />
            case "UNKNOWN":
              return (
                <HelpCircleIcon className="text-muted-foreground" />
              )
            default:
              return null
          }
        }

        const variantMap: Record<ResultTypeDTO, "default" | "destructive" | "secondary" | "outline"> = {
          OK: "outline",
          MODIFY: "outline",
          DELETE: "outline",
          UNKNOWN: "outline",
        }

        return (
          <div className="w-fit">
            <Badge
              variant={variantMap[result]}
              className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3 w-fit"
            >
              {getResultIcon(result)}
              {result}
            </Badge>
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
        const inspectorType = row.original.inspectorType
        const getInspectorIcon = (inspectorType: InspectorTypeDTO) => {
          switch (inspectorType) {
            case "HUMAN":
              return (
                <UserIcon className="text-blue-500 dark:text-blue-400" />
              )
            case "AI":
              return (
                <SparklesIcon className="text-purple-500 dark:text-purple-400" />
              )
            case "UNKNOWN":
              return (
                <HelpCircleIcon className="text-muted-foreground" />
              )
            default:
              return null
          }
        }

        return (
          <div className="w-fit">
            <Badge
              variant="outline"
              className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3 w-fit"
            >
              {getInspectorIcon(inspectorType)}
              {inspectorType}
            </Badge>
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

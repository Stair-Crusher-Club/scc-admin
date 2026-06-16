"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { AdminPlaceListDto } from "@/lib/generated-sources/openapi"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table"

import { ACCESS_CONTROL_LABELS, getAccessControlBadgeVariant } from "./accessControl"
import { ActionsCell } from "./Cells"

export const getColumns = (): ColumnDef<AdminPlaceListDto>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="이름" />,
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.name}</div>
    },
  },
  {
    accessorKey: "shortName",
    header: "짧은 이름",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {row.original.shortName ?? "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "accessControl",
    header: "공개 설정",
    cell: ({ row }) => {
      const accessControl = row.original.accessControl
      return (
        <Badge variant={getAccessControlBadgeVariant(accessControl)}>
          {ACCESS_CONTROL_LABELS[accessControl]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "placeCount",
    header: "장소 수",
    cell: ({ row }) => {
      return <div className="text-center">{row.original.placeCount}개</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="생성일" />,
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt.value), "yyyy.MM.dd HH:mm")}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell placeList={row.original} />,
  },
]

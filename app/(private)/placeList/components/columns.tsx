"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { AdminPlaceListDto } from "@/lib/generated-sources/openapi"

import { DataTableColumnHeader } from "@/components/ui/data-table"

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

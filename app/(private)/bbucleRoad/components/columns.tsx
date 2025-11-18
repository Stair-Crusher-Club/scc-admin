"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { BbucleRoadPageDTO } from "@/lib/generated-sources/openapi"

import { DataTableColumnHeader } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"

import { ActionsCell } from "./Cells"

export const getColumns = (): ColumnDef<BbucleRoadPageDTO>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="제목" />,
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.title}</div>
    },
  },
  {
    accessorKey: "sections",
    header: "섹션 수",
    cell: ({ row }) => {
      return <div className="text-center">{row.original.sections.length}개</div>
    },
  },
  {
    id: "markerCount",
    header: "마커 수",
    cell: ({ row }) => {
      const totalMarkers = row.original.sections.reduce(
        (sum, section) => sum + (section.markers?.length ?? 0),
        0,
      )
      return <div className="text-center">{totalMarkers}개</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="생성일" />,
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "yyyy.MM.dd HH:mm")}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell page={row.original} />,
  },
]

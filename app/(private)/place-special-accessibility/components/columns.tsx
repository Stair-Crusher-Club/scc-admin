"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { AdminPlaceSpecialAccessibilityDto } from "@/lib/generated-sources/openapi"

import { DataTableColumnHeader } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"

const bbucleRoadTypeLabels: Record<string, string> = {
  BASEBALL_STADIUM: "야구장",
  CONCERT_HALL: "공연장",
}

export const getColumns = (): ColumnDef<AdminPlaceSpecialAccessibilityDto>[] => [
  {
    id: "thumbnail",
    header: "썸네일",
    cell: ({ row }) => {
      const url = row.original.bbucleRoadData?.thumbnailImageUrl
      return url ? (
        <div className="relative w-20 h-20 rounded overflow-hidden">
          <img src={url} alt="썸네일" className="w-full h-full object-cover" />
        </div>
      ) : <span className="text-muted-foreground">-</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: "placeName",
    header: ({ column }) => <DataTableColumnHeader column={column} title="장소명" />,
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.placeName}</div>
    },
  },
  {
    accessorKey: "accessibilityType",
    header: "접근성 타입",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.accessibilityType}</Badge>
    },
  },
  {
    accessorKey: "bbucleRoadType",
    header: "뿌클로드 타입",
    cell: ({ row }) => {
      const type = row.original.bbucleRoadData?.bbucleRoadType
      return type ? <Badge>{bbucleRoadTypeLabels[type] ?? type}</Badge> : <span className="text-muted-foreground">-</span>
    },
  },
  {
    accessorKey: "bbucleRoadUrl",
    header: "뿌클로드 URL",
    cell: ({ row }) => {
      const url = row.original.bbucleRoadData?.bbucleRoadUrl
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline truncate max-w-[200px] block"
          onClick={(e) => e.stopPropagation()}
        >
          {url}
        </a>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
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
]

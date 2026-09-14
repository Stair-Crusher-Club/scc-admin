"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { AdminConquerTargetPlaceDto, AdminConquerTargetPlaceListDto } from "@/lib/generated-sources/openapi"

import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table"

import { ActionsCell, PlaceActionsCell } from "./Cells"

export const getColumns = (): ColumnDef<AdminConquerTargetPlaceListDto>[] => [
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
    id: "conqueredCount",
    header: "정복 수",
    cell: ({ row }) => {
      const { placeCount, conqueredPlaceCount } = row.original
      const percent = placeCount > 0 ? Math.round((conqueredPlaceCount / placeCount) * 100) : 0
      return (
        <div className="flex items-center justify-center gap-2">
          <span>
            {conqueredPlaceCount} / {placeCount}
          </span>
          <Badge variant="secondary">{percent}%</Badge>
        </div>
      )
    },
  },
  {
    id: "period",
    header: "기간",
    cell: ({ row }) => {
      const { startAt, endAt } = row.original
      const startLabel = startAt ? format(new Date(startAt.value), "yyyy.MM.dd") : ""
      const endLabel = endAt ? format(new Date(endAt.value), "yyyy.MM.dd") : ""
      // 한쪽만 있으면 그쪽 라벨만 남기고 trim으로 남는 " ~ "/"~ " 여백을 정리한다.
      const period = !startAt && !endAt ? "제한 없음" : `${startLabel} ~ ${endLabel}`.trim()
      return <div className="text-sm text-muted-foreground">{period}</div>
    },
  },
  {
    accessorKey: "isActive",
    header: "상태",
    cell: ({ row }) => {
      return <Badge variant={row.original.isActive ? "default" : "secondary"}>{row.original.isActive ? "활성" : "비활성"}</Badge>
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

export const getPlaceColumns = (placeListId: string): ColumnDef<AdminConquerTargetPlaceDto>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="장소명" />,
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.name}</div>
    },
  },
  {
    accessorKey: "address",
    header: "주소",
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.original.address}</div>
    },
  },
  {
    accessorKey: "isConquered",
    header: "정복 여부",
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isConquered ? "default" : "secondary"}>
          {row.original.isConquered ? "정복됨" : "미정복"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PlaceActionsCell placeListId={placeListId} place={row.original} />,
  },
]

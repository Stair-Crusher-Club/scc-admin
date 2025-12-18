"use client"

import { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"

import { AdminAccessibilityDTO } from "@/lib/generated-sources/openapi"
import { SearchAccessibilitiesPayload } from "@/lib/apis/api"

import { Badge } from "@/components/ui/badge"

import { ActionsCell, ImagesCell } from "./Cells"

export function getColumns(
  ctx?: SearchAccessibilitiesPayload
): ColumnDef<AdminAccessibilityDTO>[] {
  return [
    {
      accessorKey: "placeAccessibility.placeName",
      header: () => <div className="text-center font-semibold">장소명</div>,
      cell: ({ row }) => {
        const placeName = row.original.placeAccessibility.placeName
        return (
          <div className="font-medium max-w-[200px] truncate" title={placeName}>
            {placeName}
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: "includesString",
    },
    {
      accessorKey: "placeAccessibility.images",
      header: () => <div className="text-center font-semibold">장소 사진</div>,
      cell: ({ row }) => (
        <ImagesCell
          images={row.original.placeAccessibility.images.map(
            (item) => item.thumbnailUrl ?? item.imageUrl
          )}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "buildingAccessibility.images",
      header: () => <div className="text-center font-semibold">건물 사진</div>,
      cell: ({ row }) => (
        <ImagesCell
          images={mergeBuildingAccessibilityImages(
            row.original.buildingAccessibility
          )}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "placeAccessibility.registeredUserName",
      header: () => <div className="text-center font-semibold">촬영자</div>,
      cell: ({ row }) => {
        return (
          <div className="text-sm text-center">
            {row.original.placeAccessibility.registeredUserName}
          </div>
        )
      },
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: "includesString",
    },
    {
      accessorKey: "placeAccessibility.createdAtMillis",
      header: () => <div className="text-center font-semibold whitespace-nowrap">촬영 일시</div>,
      cell: ({ row }) => {
        const date = dayjs(row.original.placeAccessibility.createdAtMillis)
        return (
          <div className="text-sm text-center whitespace-nowrap">
            {date.format("YYYY-MM-DD HH:mm")}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "placeAccessibility.isFirstFloor",
      header: () => <div className="text-center font-semibold whitespace-nowrap">1층 여부</div>,
      cell: ({ row }) => {
        const isFirstFloor = row.original.placeAccessibility.isFirstFloor
        return (
          <div className="flex justify-center">
            <Badge variant={isFirstFloor ? "default" : "secondary"}>
              {isFirstFloor ? "1층" : "1층 아님"}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "placeAccessibility.stairInfo",
      header: () => <div className="text-center font-semibold whitespace-nowrap">계단 정보</div>,
      cell: ({ row }) => {
        const stairInfo = row.original.placeAccessibility.stairInfo
        const stairMap: Record<string, string> = {
          NONE: "없음",
          ONE: "1개",
          TWO_TO_FIVE: "2~5개",
          OVER_SIX: "6개 이상",
        }
        return <div className="text-sm text-center whitespace-nowrap">{stairMap[stairInfo] || stairInfo}</div>
      },
      enableSorting: false,
      size: 100,
      minSize: 100,
    },
    {
      accessorKey: "buildingAccessibility.hasElevator",
      header: () => <div className="text-center font-semibold whitespace-nowrap">엘리베이터</div>,
      cell: ({ row }) => {
        const hasElevator = row.original.buildingAccessibility?.hasElevator
        if (hasElevator === undefined) return <div className="text-sm text-center text-muted-foreground">-</div>
        return (
          <div className="flex justify-center">
            <Badge variant={hasElevator ? "default" : "secondary"}>
              {hasElevator ? "있음" : "없음"}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <div className="text-center font-semibold">작업</div>,
      cell: ({ row }) => <ActionsCell accessibility={row.original} ctx={ctx} />,
      enableSorting: false,
    },
  ]
}

const mergeBuildingAccessibilityImages = (
  buildingAccessibility?: AdminAccessibilityDTO["buildingAccessibility"]
) => {
  const imageUrls: string[] = []
  if (buildingAccessibility == null) return imageUrls

  if (buildingAccessibility.entranceImages.length > 0) {
    buildingAccessibility.entranceImages.forEach((image) => {
      imageUrls.push(image.thumbnailUrl ?? image.imageUrl)
    })
  }
  if (buildingAccessibility.elevatorImages.length > 0) {
    buildingAccessibility.elevatorImages.forEach((image) => {
      imageUrls.push(image.thumbnailUrl ?? image.imageUrl)
    })
  }

  return imageUrls
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"

import { AdminBuildingDivisionDTO, AdminBuildingDivisionStatusDTO } from "@/lib/generated-sources/openapi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Contents } from "@/components/layout"

import { useBuildingDivisions } from "./query"

const STATUS_LABELS: Record<AdminBuildingDivisionStatusDTO, string> = {
  PENDING: "대기 중",
  CONFIRMED: "확정됨",
  IGNORED: "무시됨",
}

export default function BuildingDivisionPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<AdminBuildingDivisionStatusDTO | undefined>("PENDING")
  const { data, fetchNextPage, hasNextPage, isLoading, error } = useBuildingDivisions(statusFilter)
  const divisions: AdminBuildingDivisionDTO[] =
    data?.pages.flatMap((p) => p.items)?.filter((it) => it !== undefined) ?? []

  if (isLoading) {
    return (
      <Contents.Normal>
        <div className="p-8 text-center text-gray-500">로딩 중...</div>
      </Contents.Normal>
    )
  }

  if (error) {
    return (
      <Contents.Normal>
        <div className="p-8 text-center text-red-500">
          에러: {error instanceof Error ? error.message : '알 수 없는 에러'}
        </div>
      </Contents.Normal>
    )
  }

  return (
    <Contents.Normal>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Building Division 관리</h1>
        <p className="text-sm text-gray-600">
          하나의 Building ID에 여러 건물이 존재하는 경우 SubBuilding으로 분할하여 관리합니다.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={statusFilter === undefined ? "default" : "outline"}
          onClick={() => setStatusFilter(undefined)}
          size="sm"
        >
          전체
        </Button>
        <Button
          variant={statusFilter === "PENDING" ? "default" : "outline"}
          onClick={() => setStatusFilter("PENDING")}
          size="sm"
        >
          대기 중
        </Button>
        <Button
          variant={statusFilter === "CONFIRMED" ? "default" : "outline"}
          onClick={() => setStatusFilter("CONFIRMED")}
          size="sm"
        >
          확정됨
        </Button>
        <Button
          variant={statusFilter === "IGNORED" ? "default" : "outline"}
          onClick={() => setStatusFilter("IGNORED")}
          size="sm"
        >
          무시됨
        </Button>
      </div>

      <Card>
        {divisions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Building Division이 없습니다.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상태</TableHead>
                <TableHead>Building ID</TableHead>
                <TableHead>주소</TableHead>
                <TableHead>SubBuilding 수</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>확정일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {divisions.map((division) => (
                <TableRow
                  key={division.id}
                  onClick={() => router.push(`/buildingDivision/${division.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        division.status === "PENDING"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                          : division.status === "CONFIRMED"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-gray-50 text-gray-700 border-gray-300"
                      }
                    >
                      {STATUS_LABELS[division.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{division.buildingId}</TableCell>
                  <TableCell>{division.roadAddress}</TableCell>
                  <TableCell>{division.subBuildingsCount ?? 0}개</TableCell>
                  <TableCell className="text-gray-600">
                    {dayjs(division.createdAt?.value).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {division.confirmedAt ? dayjs(division.confirmedAt.value).format("YYYY-MM-DD HH:mm") : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {hasNextPage && (
        <Button
          variant="outline"
          onClick={() => fetchNextPage()}
          className="w-full mt-4"
        >
          더 불러오기
        </Button>
      )}
    </Contents.Normal>
  )
}

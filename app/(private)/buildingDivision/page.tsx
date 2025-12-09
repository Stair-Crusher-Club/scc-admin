"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import dayjs from "dayjs"

import { AdminBuildingDivisionStatusDTO, AdminBuildingDivisionWithCountDTO } from "@/lib/generated-sources/openapi"
import { Badge } from "@/components/ui/badge"
import { Contents } from "@/components/layout"

import { useBuildingDivisions } from "./query"
import * as S from "./page.style"

const STATUS_LABELS: Record<AdminBuildingDivisionStatusDTO, string> = {
  PENDING: "대기 중",
  CONFIRMED: "확정됨",
  IGNORED: "무시됨",
}

export default function BuildingDivisionPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<AdminBuildingDivisionStatusDTO | undefined>("PENDING")
  const { data, fetchNextPage, hasNextPage } = useBuildingDivisions(statusFilter)
  const divisions: AdminBuildingDivisionWithCountDTO[] =
    data?.pages.flatMap((p) => p.items)?.filter((it) => it !== undefined) ?? []

  return (
    <Contents.Normal>
      <S.Header>
        <S.Title>Building Division 관리</S.Title>
        <S.Description>
          하나의 Building ID에 여러 건물이 존재하는 경우 SubBuilding으로 분할하여 관리합니다.
        </S.Description>
      </S.Header>

      <S.FilterContainer>
        <S.FilterButton active={statusFilter === undefined} onClick={() => setStatusFilter(undefined)}>
          전체
        </S.FilterButton>
        <S.FilterButton active={statusFilter === "PENDING"} onClick={() => setStatusFilter("PENDING")}>
          대기 중
        </S.FilterButton>
        <S.FilterButton active={statusFilter === "CONFIRMED"} onClick={() => setStatusFilter("CONFIRMED")}>
          확정됨
        </S.FilterButton>
        <S.FilterButton active={statusFilter === "IGNORED"} onClick={() => setStatusFilter("IGNORED")}>
          무시됨
        </S.FilterButton>
      </S.FilterContainer>

      <S.TableWrapper>
        {divisions.length === 0 ? (
          <S.EmptyMessage>Building Division이 없습니다.</S.EmptyMessage>
        ) : (
          <S.Table>
            <S.TableHeader>
              <S.TableRow>
                <S.TableHeaderCell>상태</S.TableHeaderCell>
                <S.TableHeaderCell>Building ID</S.TableHeaderCell>
                <S.TableHeaderCell>주소</S.TableHeaderCell>
                <S.TableHeaderCell>SubBuilding 수</S.TableHeaderCell>
                <S.TableHeaderCell>생성일</S.TableHeaderCell>
                <S.TableHeaderCell>확정일</S.TableHeaderCell>
              </S.TableRow>
            </S.TableHeader>
            <S.TableBody>
              {divisions.map((division) => (
                <S.TableRow
                  key={division.id}
                  onClick={() => router.push(`/buildingDivision/${division.id}`)}
                  clickable
                >
                  <S.TableCell>
                    <Badge variant="outline">{STATUS_LABELS[division.status]}</Badge>
                  </S.TableCell>
                  <S.TableCell>{division.buildingId}</S.TableCell>
                  <S.TableCell>{division.roadAddress}</S.TableCell>
                  <S.TableCell>{division.subBuildingsCount}개</S.TableCell>
                  <S.TableCell>{dayjs(division.createdAt?.value).format("YYYY-MM-DD HH:mm")}</S.TableCell>
                  <S.TableCell>
                    {division.confirmedAt ? dayjs(division.confirmedAt.value).format("YYYY-MM-DD HH:mm") : "-"}
                  </S.TableCell>
                </S.TableRow>
              ))}
            </S.TableBody>
          </S.Table>
        )}
      </S.TableWrapper>

      {hasNextPage && <S.LoadMoreButton onClick={() => fetchNextPage()}>더 불러오기</S.LoadMoreButton>}
    </Contents.Normal>
  )
}

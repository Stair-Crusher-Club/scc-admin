"use client"

import { useState } from "react"

import { deleteBuildingAccessibility, deletePlaceAccessibility, searchAccessibilities } from "@/lib/apis/api"
import { AccessibilitySummary, BuildingAccessibility, PlaceAccessibility } from "@/lib/models/accessibility"

import AccessibilityRow from "@/(private)/accessibility/components/AccessibilityRow"
import { Contents, Header } from "@/components/layout"

import * as S from "./page.style"

const limit = 10

export default function AccessibilityList() {
  const [query, setQuery] = useState<string>("")
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [accessibilitySummaries, setAccessibilitySummaries] = useState<AccessibilitySummary[]>([])

  const searchAccessibilitiesWithNewQuery = () => {
    searchAccessibilities(query, undefined, limit).then((res) => {
      setAccessibilitySummaries(res.items)
      setCursor(res.cursor)
    })
  }

  const loadNextPage = () => {
    searchAccessibilities(query, cursor, limit).then((res) => {
      setAccessibilitySummaries([...accessibilitySummaries, ...res.items])
      setCursor(res.cursor)
    })
  }

  const handleDeletePlaceAccessibility = (accessibilitySummary: AccessibilitySummary) => {
    const { id, placeName } = accessibilitySummary.placeAccessibility
    if (!confirm(`정말 [${placeName}] 장소의 정보를 삭제하시겠습니까?`)) return
    deletePlaceAccessibility({ id }).then(() => {
      setAccessibilitySummaries(accessibilitySummaries.filter((it) => it.placeAccessibility.id !== id))
    })
  }

  const handleDeleteBuildingAccessibility = (accessibilitySummary: AccessibilitySummary) => {
    const id = accessibilitySummary.buildingAccessibility?.id
    const placeName = accessibilitySummary.placeAccessibility.placeName
    if (!id) return
    if (!confirm(`정말 [${placeName}] 장소의 건물 정보를 삭제하시겠습니까?`)) return
    deleteBuildingAccessibility({ id }).then(() => {
      setAccessibilitySummaries(
        accessibilitySummaries.map((it) => {
          if (it.buildingAccessibility?.id !== id) {
            return it
          }
          return {
            placeAccessibility: it.placeAccessibility,
            buildingAccessibility: undefined,
          }
        }),
      )
    })
  }

  return (
    <>
      <Header title="등록된 정보 관리" />
      <Contents.Normal>
        <input
          type="text"
          name="query"
          placeholder="등록 최신순 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <S.SearchButton onClick={searchAccessibilitiesWithNewQuery}>검색</S.SearchButton>
        <S.TableWrapper>
          <S.AccessibilityTable>
            <S.HeaderRow>
              <S.HeaderCell>장소명</S.HeaderCell>
              <S.HeaderCell>정복자</S.HeaderCell>
              <S.HeaderCell>정복 시점</S.HeaderCell>
              <S.HeaderCell>장소 사진</S.HeaderCell>
              <S.HeaderCell>건물 사진</S.HeaderCell>
              <S.HeaderCell>삭제</S.HeaderCell>
            </S.HeaderRow>
            {accessibilitySummaries.map((accessibilitySummary) => (
              <AccessibilityRow
                key={accessibilitySummary.placeAccessibility.id}
                accessibilitySummary={accessibilitySummary}
                onDeletePlaceAccessibility={handleDeletePlaceAccessibility}
                onDeleteBuildingAccessibility={handleDeleteBuildingAccessibility}
              />
            ))}
          </S.AccessibilityTable>
        </S.TableWrapper>
        {cursor ? (
          <S.LoadNextPageButton onClick={loadNextPage} disabled={!cursor}>
            더 불러오기
          </S.LoadNextPageButton>
        ) : null}
      </Contents.Normal>
    </>
  )
}

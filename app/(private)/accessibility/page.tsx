"use client"

import { useState } from "react"

import {
    deleteBuildingAccessibility,
    deletePlaceAccessibility,
    searchAccessibilities,
} from "@/lib/apis/api"

import {AccessibilitySummary} from "@/lib/models/accessibility";
import * as S from "./page.style"

const limit = 10

export default function AccessibilityList() {
  const [query, setQuery] = useState<string>("")
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [accessibilitySummaries, setAccessibilitySummaries] = useState<AccessibilitySummary[]>([])

  const searchAccessibilitiesWithNewQuery = () => {
    searchAccessibilities(query, undefined, limit)
      .then((res) => {
        setAccessibilitySummaries(res.items)
        setCursor(res.cursor)
      })
  }

  const loadNextPage = () => {
    searchAccessibilities(query, cursor, limit)
      .then((res) => {
        setAccessibilitySummaries([...accessibilitySummaries, ...res.items])
        setCursor(res.cursor)
      })
  }

  const handleDeletePlaceAccessibility = (id: string, placeName: string) => {
    if (!confirm(`정말 [${placeName}] 장소의 정보를 삭제하시겠습니까?`)) return
    deletePlaceAccessibility({ id })
      .then(() => {
        setAccessibilitySummaries(accessibilitySummaries.filter((it) => it.placeAccessibility.id !== id))
      })
  }

  const handleDeleteBuildingAccessibility = (id: string | undefined, placeName: string) => {
    if (!id) return
    if (!confirm(`정말 [${placeName}] 장소의 건물 정보를 삭제하시겠습니까?`)) return
    deleteBuildingAccessibility({ id })
      .then(() => {
        setAccessibilitySummaries(
          accessibilitySummaries.map((it) => {
            if (it.buildingAccessibility?.id !== id) {
              return it
            }
            return {
              placeAccessibility: it.placeAccessibility,
              buildingAccessibility: undefined,
            }
          })
        )
      })
  }

  return (
    <S.Page>
      <S.PageTitle>
        등록된 정보 관리
      </S.PageTitle>
      <input
        type="text"
        name="query"
        placeholder="등록 최신순 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <S.SearchButton
        onClick={searchAccessibilitiesWithNewQuery}
      >
        검색
      </S.SearchButton>
      <S.Accessibilities>
        {accessibilitySummaries.map((accessibility) => (
          <S.Accessibility key={accessibility.placeAccessibility.id}>
            장소명: {accessibility.placeAccessibility.placeName} / 등록자: {accessibility.placeAccessibility.registeredUserName || "익명의 정복자"}
            <S.DeleteButton onClick={() => handleDeletePlaceAccessibility(accessibility.placeAccessibility.id, accessibility.placeAccessibility.placeName)}>
              장소 정보 삭제
            </S.DeleteButton>
            {
              accessibility.buildingAccessibility
                ? (
                  <S.DeleteButton
                    onClick={() => handleDeleteBuildingAccessibility(accessibility.buildingAccessibility?.id, accessibility.placeAccessibility.placeName)}
                  >
                    건물 정보 삭제
                  </S.DeleteButton>
                )
                : <S.DeleteButton disabled>건물 정보 없음</S.DeleteButton>
            }

          </S.Accessibility>
        ))}
      </S.Accessibilities>
      {
        cursor
          ? <S.LoadNextPageButton
            onClick={loadNextPage}
            disabled={!cursor}
          >
            더 불러오기
          </S.LoadNextPageButton>
          : null
      }
    </S.Page>
  )
}

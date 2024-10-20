"use client"

import { Contents, Header } from "@/components/layout"

import { ActionsCell } from "./components/Cells"
import * as S from "./page.style"
import { useClosedPlaceCandidates } from "./query"

export default function AccessibilityList() {
  const { data, fetchNextPage, hasNextPage, refetch } = useClosedPlaceCandidates()
  const closedPlaceCandidates = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <>
      <Header title="폐업 추정 장소 관리" />
      <Contents.Normal>
        <S.TableWrapper>
          <div>
            {closedPlaceCandidates.length === 0 ? (
              <p>폐업 추정 장소가 없습니다.</p>
            ) : (
              <>
                {closedPlaceCandidates.map((closedPlaceCandidate) => (
                  <S.RowWrapper key={closedPlaceCandidate.id}>
                    <p>장소 : {closedPlaceCandidate.name}</p>
                    <ActionsCell closedPlaceCandidate={closedPlaceCandidate} />
                  </S.RowWrapper>
                ))}
              </>
            )}
          </div>
        </S.TableWrapper>
        {hasNextPage && <S.LoadNextPageButton onClick={() => fetchNextPage()}>더 불러오기</S.LoadNextPageButton>}
      </Contents.Normal>
    </>
  )
}

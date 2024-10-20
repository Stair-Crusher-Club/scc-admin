"use client"

import { Contents, Header } from "@/components/layout"
import Image from "next/image"
import dayjs from "dayjs"

import { ActionsCell } from "./components/Cells"
import * as S from "./page.style"
import naverMapIcon from "../../../public/naver_map.jpg"

import { useClosedPlaceCandidates } from "./query"
import { ClosedPlaceCandidate } from "@/lib/models/place"

export default function AccessibilityList() {
  const { data, fetchNextPage, hasNextPage, refetch } = useClosedPlaceCandidates()
  const closedPlaceCandidates = data?.pages.flatMap((p) => p.items) ?? []

  function openNaverMap(closedPlaceCandidate: ClosedPlaceCandidate) {
    const isMobile = false
    if (isMobile) {
      window.open(`nmap://search?query=${closedPlaceCandidate.name}`)
    } else {
      window.open(`https://map.naver.com/p/search/${closedPlaceCandidate.name}`)
    }
  }

  console.log(closedPlaceCandidates)

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
                {closedPlaceCandidates.map((candidate) => (
                  <S.RowWrapper key={candidate.id}>
                    <p>
                      {candidate.name}({candidate.address}), {dayjs(candidate.createdAt.value).format("YYYY-MM-DD")} 폐업 추정
                    </p>
                    <S.ExternalMap onClick={() => openNaverMap(candidate)}>
                      <Image src={naverMapIcon} alt="네이버 지도" />
                    </S.ExternalMap>
                    <ActionsCell closedPlaceCandidate={candidate} />
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

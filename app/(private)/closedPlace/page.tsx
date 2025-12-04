"use client"

import dayjs from "dayjs"
import Image from "next/image"
import { useState } from "react"

import { AdminClosedPlaceCandidateDTO } from "@/lib/generated-sources/openapi"

import { Contents } from "@/components/layout"

import naverMapIcon from "../../../public/naver_map.jpg"
import { ActionsCell } from "./components/Cells"
import * as S from "./page.style"
import { useClosedPlaceCandidates } from "./query"

export default function ClosedPlacePage() {
  const [activeTab, setActiveTab] = useState<"all" | "registered">("all")
  const { data, fetchNextPage, hasNextPage, refetch } = useClosedPlaceCandidates(activeTab === "registered")
  const closedPlaceCandidates: AdminClosedPlaceCandidateDTO[] =
    data?.pages.flatMap((p) => p.items)?.filter((it) => it !== undefined) ?? []

  function openNaverMap(closedPlaceCandidate: AdminClosedPlaceCandidateDTO) {
    const isMobile = false
    if (isMobile) {
      window.open(`nmap://search?query=${closedPlaceCandidate.name}`)
    } else {
      window.open(`https://map.naver.com/p/search/${closedPlaceCandidate.name}`)
    }
  }

  return (
    <>
      <Contents.Normal>
        <S.TabContainer>
          <S.Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>
            전체
          </S.Tab>
          <S.Tab active={activeTab === "registered"} onClick={() => setActiveTab("registered")}>
            접근성 정보가 등록된 장소
          </S.Tab>
        </S.TabContainer>
        <S.TableWrapper>
          <div>
            {closedPlaceCandidates.length === 0 ? (
              <p>폐업 추정 장소가 없습니다.</p>
            ) : (
              <>
                {closedPlaceCandidates.map((candidate) => (
                  <S.RowWrapper key={candidate.id}>
                    <S.TextContent>
                      {candidate.name}({candidate.address}), {dayjs(candidate.closedAt?.value).format("YYYY-MM-DD")}{" "}
                      폐업 추정
                    </S.TextContent>
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

"use client"

import Image from "next/image"

import { AdminBuildingDeduplicationCandidateDTO } from "@/lib/generated-sources/openapi"

import { Contents, Header } from "@/components/layout"

import naverMapIcon from "../../../public/naver_map.jpg"
import * as S from "./page.style"
import { useBuildingDeduplicationCandidates } from "./query"

export default function BuildingDeduplicationPage() {
  const { data, fetchNextPage, hasNextPage } = useBuildingDeduplicationCandidates()
  const buildingDeduplicationCandidates: AdminBuildingDeduplicationCandidateDTO[] =
    data?.pages.flatMap((p) => p.items)?.filter((it) => it !== undefined) ?? []

  function openNaverMap(candidate: AdminBuildingDeduplicationCandidateDTO) {
    const isMobile = false
    if (isMobile) {
      window.open(`nmap://search?query=${candidate.buildingName}`)
    } else {
      window.open(`https://map.naver.com/p/search/${candidate.buildingName}`)
    }
  }

  return (
    <>
      <Header title="건물 중복 제거 후보 관리" />
      <Contents.Normal>
        <S.TableWrapper>
          <div>
            {buildingDeduplicationCandidates.length === 0 ? (
              <p>건물 중복 제거 후보가 없습니다.</p>
            ) : (
              <>
                {buildingDeduplicationCandidates.map((candidate) => (
                  <S.RowWrapper key={candidate.id}>
                    <S.BuildingInfo>
                      <S.BuildingName>{candidate.buildingName}</S.BuildingName>
                      <S.BuildingAddress>{candidate.roadAddress}</S.BuildingAddress>
                      <S.BuildingIds>
                        현재 ID: {candidate.currentBuildingId} → 새 ID: {candidate.newBuildingId}
                      </S.BuildingIds>
                      <S.LocationInfo>
                        위치: {candidate.location.lat.toFixed(6)}, {candidate.location.lng.toFixed(6)}
                      </S.LocationInfo>
                    </S.BuildingInfo>
                    <S.ExternalMap onClick={() => openNaverMap(candidate)}>
                      <Image src={naverMapIcon} alt="네이버 지도" />
                    </S.ExternalMap>
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

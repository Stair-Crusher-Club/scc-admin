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

  function openNaverMapForAddress(address: string) {
    const isMobile = false
    if (isMobile) {
      window.open(`nmap://search?query=${address}`)
    } else {
      window.open(`https://map.naver.com/p/search/${address}`)
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
                      <S.BuildingName>건물 1: {candidate.building1Name || "이름 없음"}</S.BuildingName>
                      <S.BuildingIds>ID: {candidate.building1Id}</S.BuildingIds>
                      <S.LocationInfo>
                        위치: {candidate.building1Location.lat.toFixed(6)}, {candidate.building1Location.lng.toFixed(6)}
                      </S.LocationInfo>
                    </S.BuildingInfo>
                    <S.BuildingInfo>
                      <S.BuildingName>건물 2: {candidate.building2Name || "이름 없음"}</S.BuildingName>
                      <S.BuildingIds>ID: {candidate.building2Id}</S.BuildingIds>
                      <S.LocationInfo>
                        위치: {candidate.building2Location.lat.toFixed(6)}, {candidate.building2Location.lng.toFixed(6)}
                      </S.LocationInfo>
                    </S.BuildingInfo>
                    <S.BuildingInfo>
                      <S.BuildingAddress>{candidate.normalizedAddress}</S.BuildingAddress>
                      <S.LocationInfo>거리: {candidate.distanceInMeters.toFixed(2)}m</S.LocationInfo>
                      {candidate.canonicalBuildingId && (
                        <S.LocationInfo>기준으로 삼을 건물의 ID: {candidate.canonicalBuildingId}</S.LocationInfo>
                      )}
                    </S.BuildingInfo>
                    <S.ExternalMap onClick={() => openNaverMapForAddress(candidate.normalizedAddress)}>
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

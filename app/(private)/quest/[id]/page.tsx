"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { useQuest } from "@/lib/apis/api"
import { ClubQuestTargetBuildingDTO} from "@/lib/generated-sources/openapi"

import Map from "@/components/Map"
import { Me, QuestMarker } from "@/components/Map/components"
import { Contents } from "@/components/layout"
import { useModal } from "@/hooks/useModal"

import * as S from "./page.style"

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: quest } = useQuest({ id })
  const [map, setMap] = useState<kakao.maps.Map>()
  const { openModal } = useModal()
  const queryClient = useQueryClient()
  const intialized = useRef(false)

  // 10초마다 퀘스트 진행 상황을 갱신합니다.
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["@quests", id] })
    }, 10 * 1000)
    return () => clearInterval(interval)
  }, [quest?.id])

  useEffect(() => {
    // 퀘스트 업데이트 시마다 센터가 변경되지 않게 처리
    if (intialized.current) return
    // 퀘스트 정보와 지도를 둘 다 불러와야 초기화 가능
    if (!quest || !map) return
    const center = getCenterOf(quest.buildings)
    map.setCenter(center)
    intialized.current = true
  }, [quest, map])

  function getCenterOf(buildings: ClubQuestTargetBuildingDTO[]) {
    const coords = buildings.map((b) => b.location)
    const center = {
      lat: coords.reduce((acc, c) => acc + c.lat, 0) / coords.length,
      lng: coords.reduce((acc, c) => acc + c.lng, 0) / coords.length,
    }
    return new kakao.maps.LatLng(center.lat, center.lng)
  }

  function openSummary() {
    openModal({ type: "QuestSummarySheet", props: { questId: quest?.id ?? "" } })
  }

  return (
    <>
      <Contents>
        <S.Container>
          <Map id="map" initializeOptions={{ center: { lat: 37.566826, lng: 126.9786567 } }} onInit={setMap}>
            {quest?.buildings.map((building, index) => (
              <QuestMarker key={building.buildingId} building={building} questId={quest.id} buildingIndex={index} />
            ))}
            <Me />
          </Map>
          <S.SummaryButton onClick={openSummary}>개요</S.SummaryButton>
        </S.Container>
      </Contents>
    </>
  )
}

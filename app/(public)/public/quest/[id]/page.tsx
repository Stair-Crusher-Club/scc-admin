"use client"

import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useAtomValue } from "jotai"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { useQuest } from "@/lib/apis/api"
import { AppState } from "@/lib/globalAtoms"
import { QuestBuilding } from "@/lib/models/quest"
import { storage } from "@/lib/storage"

import Map from "@/components/Map"
import { Me, QuestMarker } from "@/components/Map/components"
import { Contents, Header } from "@/components/layout"
import { useModal } from "@/hooks/useModal"
import QuestCompletionModal from "@/modals/QuestCompletion"

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: quest } = useQuest({ id })
  const mapRef = useRef<kakao.maps.Map>()
  const { openModal } = useModal()
  const { isHeaderHidden } = useAtomValue(AppState)
  const queryClient = useQueryClient()
  const [map, setMap] = useState<kakao.maps.Map>()
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

  // 최초 접속 시 가이드 모달을 띄워줍니다.
  useEffect(() => {
    const sawGuide = storage.get("sawQuestGuide")
    if (sawGuide) return
    openGuide()
  }, [])

  function getCenterOf(buildings: QuestBuilding[]) {
    const coords = buildings.map((b) => b.location)
    const center = {
      lat: coords.reduce((acc, c) => acc + c.lat, 0) / coords.length,
      lng: coords.reduce((acc, c) => acc + c.lng, 0) / coords.length,
    }
    return new kakao.maps.LatLng(center.lat, center.lng)
  }

  function openGuide() {
    openModal({ type: "QuestGuide", events: { onClose: () => storage.set("sawQuestGuide", Date()) } })
  }

  const placeCount = quest?.buildings.reduce((acc, building) => acc + building.places.length, 0) ?? 0
  const buildingCount = quest?.buildings.length ?? 0

  const isAllConquered = quest?.buildings.every((building) =>
    building.places.every(
      (place) =>
        place.isConquered || // 정복
        place.isNotAccessible || // 접근불가
        place.isClosed, // 폐업
    ),
  )

  // 퀘스트 완료 모달 상태
  const [openQuestionCompletionModal, setOpenQuestionCompletionModal] = useState(false)
  function closeQuestionCompletionModal() {
    setOpenQuestionCompletionModal(false)
  }

  useEffect(() => {
    if (quest && isAllConquered) {
      setOpenQuestionCompletionModal(true)
    }
  }, [isAllConquered])

  return (
    <>
      {/* public page 이므로 메뉴를 제공하지 않는 커스텀 헤더 사용 */}
      <Header
        title={
          quest ? (
            <>
              {quest?.name}
              <br />
              <small>
                {buildingCount}개 건물 / {placeCount}개 장소
              </small>
            </>
          ) : (
            ""
          )
        }
        hidden={isHeaderHidden}
        hideMenu
      >
        <Header.ActionButton onClick={openGuide}>가이드</Header.ActionButton>
      </Header>
      <Contents>
        <Map id="map" initializeOptions={{ center: { lat: 37.566826, lng: 126.9786567 } }} onInit={setMap}>
          {quest?.buildings.map((building, index) => (
            <QuestMarker key={building.buildingId} building={building} questId={quest.id} buildingIndex={index} />
          ))}
          <Me />
        </Map>
      </Contents>

      <QuestCompletionModal
        open={openQuestionCompletionModal}
        close={closeQuestionCompletionModal}
        questName={quest?.name ?? ""}
        questClearDate={format(new Date(), "yyyy.MM.dd")}
      />
    </>
  )
}

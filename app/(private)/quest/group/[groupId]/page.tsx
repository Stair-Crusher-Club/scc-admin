"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "react-toastify"

import { deleteQuestTargetBuilding, deleteQuestTargetPlace, moveQuestTargetPlace, useQuestsByGroupId } from "@/lib/apis/api"
import { ClubQuestTargetBuildingDTO } from "@/lib/generated-sources/openapi"

import { Contents, Header } from "@/components/layout"
import MapView from "@/components/Map/Map"
import { ClusterMarker } from "@/components/Map/components"

import BuildingDetailPanel from "./components/BuildingDetailPanel"
import QuestList from "./components/QuestList"
import * as S from "./page.style"
import { getQuestGroupName } from "../../util"

interface PageProps {
  params: { groupId: string }
}

export default function QuestGroupPage({ params }: PageProps) {
  const { groupId } = params
  const queryClient = useQueryClient()

  const { data: questsData, isLoading, error } = useQuestsByGroupId({ groupId })
  const quests = questsData?.items ?? []

  // 상태 관리
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null)
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null)
  const [moveMode, setMoveMode] = useState(false)
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([])

  // 선택된 건물의 상세 정보 찾기
  const selectedBuilding = (() => {
    if (!selectedBuildingId || !selectedQuestId) return null
    const quest = quests.find((q) => q.id === selectedQuestId)
    return quest?.buildings.find((b) => b.buildingId === selectedBuildingId) ?? null
  })()

  // 퀘스트별 clusterIndex 할당 (마커용, create quest 페이지와 동일한 패턴)
  const questIndexMap = new Map<string, number>()
  quests.forEach((quest, index) => {
    questIndexMap.set(quest.id, index)
  })

  // 지도 초기화
  const initializeMap = (map: kakao.maps.Map) => {
    setMapInstance(map)

    // 모든 건물 위치를 포함하도록 지도 범위 설정
    if (quests.length > 0) {
      const bounds = new kakao.maps.LatLngBounds()
      quests.forEach((quest) => {
        quest.buildings.forEach((building) => {
          bounds.extend(new kakao.maps.LatLng(building.location.lat, building.location.lng))
        })
      })
      map.setBounds(bounds)
    }
  }

  // 건물 클릭 핸들러
  const handleBuildingClick = (questId: string, buildingId: string) => {
    if (moveMode) {
      // 옮기기 모드일 때는 클릭 불가
      return
    }
    setSelectedQuestId(questId)
    setSelectedBuildingId(buildingId)
    setSelectedPlaceIds([]) // 다른 건물 선택 시 장소 선택 초기화
  }

  // 퀘스트 클릭 핸들러 (옮기기 모드에서만 작동)
  const handleQuestClick = async (targetQuestId: string) => {
    if (!moveMode || selectedPlaceIds.length === 0) return

    const sourceQuestId = selectedQuestId
    if (!sourceQuestId || sourceQuestId === targetQuestId) {
      toast.error("같은 퀘스트로는 옮길 수 없습니다")
      return
    }

    const sourceQuest = quests.find((q) => q.id === sourceQuestId)
    const targetQuest = quests.find((q) => q.id === targetQuestId)

    const confirmed = window.confirm(
      `${selectedPlaceIds.length}개의 장소를 [${sourceQuest?.name}] → [${targetQuest?.name}] 퀘스트로 옮기시겠습니까?`
    )
    if (!confirmed) return

    try {
      await moveQuestTargetPlace({
        questId: sourceQuestId,
        targetQuestId,
        placeIds: selectedPlaceIds,
      })

      // 상태 초기화
      setMoveMode(false)
      setSelectedPlaceIds([])
      setSelectedBuildingId(null)

      // 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["@questGroup", groupId] })
      toast.success("장소가 성공적으로 이동되었습니다")
    } catch (error) {
      console.error("Failed to move places:", error)
      toast.error("장소 이동에 실패했습니다")
    }
  }

  // 건물 삭제 핸들러
  const handleDeleteBuilding = async (building: ClubQuestTargetBuildingDTO) => {
    if (!selectedQuestId) return

    const confirmed = window.confirm(`[${building.name}] 건물을 정말 삭제하시겠습니까?`)
    if (!confirmed) return

    try {
      await deleteQuestTargetBuilding(selectedQuestId, building)
      setSelectedBuildingId(null)
      setSelectedPlaceIds([])
      queryClient.invalidateQueries({ queryKey: ["@questGroup", groupId] })
      toast.success("건물이 삭제되었습니다")
    } catch (error) {
      console.error("Failed to delete building:", error)
      toast.error("건물 삭제에 실패했습니다")
    }
  }

  // 장소 삭제 핸들러
  const handleDeletePlace = async (placeId: string) => {
    if (!selectedQuestId || !selectedBuilding) return

    const place = selectedBuilding.places.find((p) => p.placeId === placeId)
    if (!place) return

    const confirmed = window.confirm(`[${place.name}] 장소를 정말 삭제하시겠습니까?`)
    if (!confirmed) return

    try {
      await deleteQuestTargetPlace(selectedQuestId, place)

      // 선택된 장소 목록에서 제거
      setSelectedPlaceIds((prev) => prev.filter((id) => id !== placeId))

      // 건물의 마지막 장소였다면 패널 닫기
      if (selectedBuilding.places.length === 1) {
        setSelectedBuildingId(null)
        setSelectedPlaceIds([])
      }

      queryClient.invalidateQueries({ queryKey: ["@questGroup", groupId] })
      toast.success("장소가 삭제되었습니다")
    } catch (error) {
      console.error("Failed to delete place:", error)
      toast.error("장소 삭제에 실패했습니다")
    }
  }

  // 선택한 장소들 일괄 삭제 핸들러
  const handleDeleteSelectedPlaces = async () => {
    if (!selectedQuestId || !selectedBuilding || selectedPlaceIds.length === 0) return

    const confirmed = window.confirm(
      `선택한 ${selectedPlaceIds.length}개의 장소를 정말 삭제하시겠습니까?`
    )
    if (!confirmed) return

    try {
      // 선택된 모든 장소 삭제
      for (const placeId of selectedPlaceIds) {
        const place = selectedBuilding.places.find((p) => p.placeId === placeId)
        if (place) {
          await deleteQuestTargetPlace(selectedQuestId, place)
        }
      }

      // 모든 장소를 삭제했다면 패널 닫기
      if (selectedPlaceIds.length === selectedBuilding.places.length) {
        setSelectedBuildingId(null)
      }

      setSelectedPlaceIds([])
      queryClient.invalidateQueries({ queryKey: ["@questGroup", groupId] })
      toast.success("선택한 장소가 삭제되었습니다")
    } catch (error) {
      console.error("Failed to delete places:", error)
      toast.error("장소 삭제에 실패했습니다")
    }
  }

  // 옮기기 모드 토글
  const handleToggleMoveMode = () => {
    if (moveMode) {
      // 취소
      setMoveMode(false)
      setSelectedPlaceIds([])
    } else {
      // 시작
      if (selectedPlaceIds.length === 0) {
        toast.warn("옮길 장소를 먼저 선택해주세요")
        return
      }
      setMoveMode(true)
    }
  }

  // 장소 선택 토글
  const handleTogglePlaceSelection = (placeId: string) => {
    setSelectedPlaceIds((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    )
  }

  if (isLoading) {
    return (
      <>
        <Header title="퀘스트 그룹 관리" />
        <Contents>
          <S.LoadingContainer>로딩 중...</S.LoadingContainer>
        </Contents>
      </>
    )
  }

  if (error || !questsData) {
    return (
      <>
        <Header title="퀘스트 그룹 관리" />
        <Contents>
          <S.ErrorContainer>
            퀘스트 그룹을 불러오는 데 실패했습니다.
          </S.ErrorContainer>
        </Contents>
      </>
    )
  }

  return (
    <>
      <Header title={`퀘스트 그룹 관리 - ${getQuestGroupName(quests[0]?.name || '')}`} />
      <Contents>
        <S.Container>
          {/* 좌측 퀘스트 목록 */}
          <S.LeftPanel>
            <QuestList
              quests={quests}
              questIndexMap={questIndexMap}
              moveMode={moveMode}
              onQuestClick={handleQuestClick}
            />
          </S.LeftPanel>

          {/* 중앙 지도 */}
          <S.MapContainer>
            <MapView
              id="quest-group-map"
              initializeOptions={{
                center: { lat: 37.5665, lng: 126.9780 },
                level: 7,
              }}
              onInit={initializeMap}
            >
              {quests.map((quest) =>
                quest.buildings.map((building) => (
                  <ClusterMarker
                    key={`${quest.id}-${building.buildingId}`}
                    position={building.location}
                    clusterIndex={questIndexMap.get(quest.id) ?? 0}
                    overlayInfo={{
                      title: `${quest.name} ${building.name}`,
                      places: building.places,
                    }}
                    isSelected={
                      building.buildingId === selectedBuildingId &&
                      quest.id === selectedQuestId
                    }
                    onClick={() => handleBuildingClick(quest.id, building.buildingId)}
                  />
                ))
              )}
            </MapView>
          </S.MapContainer>

          {/* 우측 상세 패널 */}
          {selectedBuilding && selectedQuestId && (
            <S.RightPanel>
              <BuildingDetailPanel
                building={selectedBuilding}
                questId={selectedQuestId}
                questName={quests.find((q) => q.id === selectedQuestId)?.name ?? ""}
                selectedPlaceIds={selectedPlaceIds}
                moveMode={moveMode}
                onDeleteBuilding={handleDeleteBuilding}
                onDeletePlace={handleDeletePlace}
                onDeleteSelectedPlaces={handleDeleteSelectedPlaces}
                onTogglePlaceSelection={handleTogglePlaceSelection}
                onToggleMoveMode={handleToggleMoveMode}
                onClose={() => {
                  setSelectedBuildingId(null)
                  setSelectedPlaceIds([])
                }}
              />
            </S.RightPanel>
          )}
        </S.Container>
      </Contents>
    </>
  )
}

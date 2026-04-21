import { useContext, useEffect, useRef } from "react"
import { useMediaQuery } from "react-responsive"

import { ClubQuestTargetBuildingDTO } from "@/lib/generated-sources/openapi"

import { useModal } from "@/hooks/useModal"

import { MapContext } from "../Map"

type MarkerStyle = Omit<kakao.maps.MarkerOptions, "map" | "center" | "radius">

export interface Props {
  building: ClubQuestTargetBuildingDTO
  buildingIndex: number
  questId: string
  markerStyle?: MarkerStyle
  onTrackingInterrupt?: () => void
  buildings?: ClubQuestTargetBuildingDTO[]
  focusedBuildingId?: string
  onFocusChange?: (buildingId: string | undefined) => void
}

const FOCUSED_SCALE = 1.5
const FOCUSED_Z_INDEX = 999

export default function QuestMarker({
  building,
  buildingIndex,
  questId,
  markerStyle,
  onTrackingInterrupt,
  buildings,
  focusedBuildingId,
  onFocusChange,
}: Props) {
  const { map, mapElement } = useContext(MapContext)
  const { openModal, closeAll } = useModal()
  const openedModal = useRef<string>()
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const marker = useRef<kakao.maps.Marker>()

  const isFocused = focusedBuildingId === building.buildingId

  useEffect(() => {
    if (!map) return
    if (!building) return

    const latlng = new kakao.maps.LatLng(building.location.lat, building.location.lng)
    const scale = isFocused ? FOCUSED_SCALE : 1.0

    const isAllConquered = building.places.every((p) => p.isConquered || p.isClosed || p.isNotAccessible)

    const image = isAllConquered
      ? new kakao.maps.MarkerImage("/marker_conquered.png", new kakao.maps.Size(32 * scale, 32 * scale), {
          offset: new kakao.maps.Point(8 * scale, 32 * scale),
        })
      : (() => {
          const buildingIconIndex = building.name.match(/\d+번/)
            ? parseInt(building.name.match(/(\d+)번/)![0]) - 1
            : buildingIndex
          return new kakao.maps.MarkerImage(`/marker_sprite.png`, new kakao.maps.Size(24 * scale, 36 * scale), {
            offset: new kakao.maps.Point(12 * scale, 36 * scale),
            spriteOrigin: new kakao.maps.Point(24 * scale * (buildingIconIndex % 10), 36 * scale * Math.floor(buildingIconIndex / 10)),
            spriteSize: new kakao.maps.Size(24 * scale * 10, 36 * scale * 10),
          })
        })()

    const m = new kakao.maps.Marker({ position: latlng, image })
    m.setMap(map)
    if (isFocused) m.setZIndex(FOCUSED_Z_INDEX)
    marker.current = m

    kakao.maps.event.addListener(m, "click", () => onMarkerClick(building))

    return () => {
      m.setMap(null)
    }
  }, [map, building, buildingIndex, markerStyle, isFocused])

  function onMarkerClick(target: ClubQuestTargetBuildingDTO) {
    if (!map) return
    onTrackingInterrupt?.()
    openBuildingSheet(target)
  }

  function openBuildingSheet(target: ClubQuestTargetBuildingDTO) {
    if (!map) return

    closeAll()

    onFocusChange?.(target.buildingId)

    const focusPoint = getFocusedCenter(target)
    if (focusPoint) map.panTo(focusPoint)

    openedModal.current = openModal({
      type: isMobile ? "BuildingDetailSheetMobile" : "BuildingDetailSheetDesktop",
      props: {
        building: target,
        questId,
        buildings,
        onBuildingFocus: handleBuildingFocusChange,
      },
      events: { onClose: () => onModalClose(target) },
    })
  }

  // 시트 내부에서 화살표로 건물을 바꿨을 때 부모 state + 카메라 동기화
  function handleBuildingFocusChange(next: ClubQuestTargetBuildingDTO) {
    if (!map) return
    onFocusChange?.(next.buildingId)
    const focusPoint = getFocusedCenter(next)
    if (focusPoint) map.panTo(focusPoint)
  }

  function onModalClose(building: ClubQuestTargetBuildingDTO) {
    const buildingCenter = new kakao.maps.LatLng(building.location.lat, building.location.lng)
    map?.panTo(buildingCenter)
    openedModal.current = undefined
    onFocusChange?.(undefined)
  }

  /**
   * 윗쪽 300px의 공간에 마커를 센터로 위치시키려면
   * 화면 전체를 차지하는 지도의 센터가 어디여야 하는지 계산합니다.
   */
  function getFocusedCenter(building: ClubQuestTargetBuildingDTO) {
    if (!map) return

    const rect = mapElement!.getClientRects()[0]
    const ne = map.getBounds().getNorthEast()
    const sw = map.getBounds().getSouthWest()

    if (isMobile) {
      const latN = ne.getLat()
      const latS = sw.getLat()
      const latDiff = latN - latS
      const newLat = building.location.lat + ((300 / rect.height - 1) * latDiff) / 2
      return new kakao.maps.LatLng(newLat, building.location.lng)
    } else {
      const lngE = ne.getLng()
      const lngW = sw.getLng()
      const lngDiff = lngE - lngW
      const newLng = building.location.lng + ((360 / rect.width) * lngDiff) / 2
      return new kakao.maps.LatLng(building.location.lat, newLng)
    }
  }

  return null
}

import { useContext, useEffect, useRef } from "react"
import { useMediaQuery } from "react-responsive"

import { QuestBuilding } from "@/lib/models/quest"

import { useModal } from "@/hooks/useModal"

import { MapContext } from "../Map"

type MarkerStyle = Omit<kakao.maps.MarkerOptions, "map" | "center" | "radius">

export interface Props {
  building: QuestBuilding
  buildingIndex: number
  questId: string
  markerStyle?: MarkerStyle
}

export default function QuestMarker({ building, buildingIndex, questId, markerStyle }: Props) {
  const { map, mapElement } = useContext(MapContext)
  const { openModal, closeModal, closeAll } = useModal()
  const openedModal = useRef<string>()
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const marker = useRef<kakao.maps.Marker>()

  useEffect(() => {
    if (!map) return
    if (!building) return

    const latlng = new kakao.maps.LatLng(building.location.lat, building.location.lng)

    const conqueredMarker = new kakao.maps.Marker({
      position: latlng,
      image: new kakao.maps.MarkerImage("/marker_conquered.png", new kakao.maps.Size(32, 32), {
        offset: new kakao.maps.Point(8, 32),
      }),
    })
    const notConqueredMarker = new kakao.maps.Marker({
      position: latlng,
      image: new kakao.maps.MarkerImage(`/marker_sprite.png`, new kakao.maps.Size(24, 36), {
        offset: new kakao.maps.Point(12, 36),
        spriteOrigin: new kakao.maps.Point(24 * (buildingIndex % 10), 36 * Math.floor(buildingIndex / 10)),
        spriteSize: new kakao.maps.Size(24 * 10, 36 * 4),
      }),
    })
    const buildingMarker = building.places.every((p) => p.isConquered || p.isClosed || p.isNotAccessible)
      ? conqueredMarker
      : notConqueredMarker

    buildingMarker.setMap(map)
    marker.current = buildingMarker

    kakao.maps.event.addListener(marker.current, "click", () => onMarkerClick(building))

    // unmount 되면 map에서 circle을 제거.
    return () => {
      marker.current?.setMap(null)
    }
  }, [map, building, markerStyle])

  function onMarkerClick(building: QuestBuilding) {
    if (!map) return

    if (openedModal.current) {
      closeModal({ id: openedModal.current })
    }

    if (isMobile) {
      // 지도 중앙에 마커를 위치시킵니다.
      const focusPoint = getFocusedCenter(building)
      map.panTo(focusPoint!)

      // 바텀시트를 엽니다.
      openedModal.current = openModal({
        type: "BuildingDetailSheetMobile",
        props: { building, questId },
        events: { onClose: () => onModalClose(building) },
      })
    } else {
      // 지도 중앙에 마커를 위치시킵니다.
      const focusPoint = getFocusedCenter(building)
      map.panTo(focusPoint!)

      // 우측에 시트를 엽니다.
      openedModal.current = openModal({
        type: "BuildingDetailSheetDesktop",
        props: { building, questId },
        events: { onClose: () => onModalClose(building) },
      })
    }
  }

  function onModalClose(building: QuestBuilding) {
    // 모달이 닫히면 빌딩을 중앙으로 이동합니다
    const buildingCenter = new kakao.maps.LatLng(building.location.lat, building.location.lng)
    map?.panTo(buildingCenter)

    openedModal.current = undefined
  }

  /**
   * 윗쪽 300px의 공간에 마커를 센터로 위치시키려면
   * 화면 전체를 차지하는 지도의 센터가 어디여야 하는지 계산합니다.
   */
  function getFocusedCenter(building: QuestBuilding) {
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

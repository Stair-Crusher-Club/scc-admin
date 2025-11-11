import { useContext, useEffect, useRef } from "react"

import { ClubQuestTargetPlaceDTO } from "@/lib/generated-sources/openapi"

import { MapContext } from "../Map"

type MarkerStyle = Omit<kakao.maps.MarkerOptions, "map" | "center" | "radius">

export interface Props {
  position: { lat: number; lng: number } | undefined
  clusterIndex: number
  overlayInfo: {
    title: string
    places: ClubQuestTargetPlaceDTO[]
  }
  markerStyle?: MarkerStyle
  onClick?: () => void
  isSelected?: boolean
}

export default function ClusterMarker({ position, clusterIndex, overlayInfo, markerStyle, onClick, isSelected }: Props) {
  const { map } = useContext(MapContext)
  const marker = useRef<kakao.maps.Marker>()
  const overlay = useRef<kakao.maps.CustomOverlay>()

  useEffect(() => {
    if (!map) return
    if (!position) return

    const latlng = new kakao.maps.LatLng(position.lat, position.lng)

    marker.current = new kakao.maps.Marker({
      map,
      position: latlng,
      image: new kakao.maps.MarkerImage("/marker_cluster_sprite.png", new kakao.maps.Size(24, 36), {
        offset: new kakao.maps.Point(12, 36),
        spriteOrigin: new kakao.maps.Point(24 * (clusterIndex % 10), 36 * Math.floor(clusterIndex / 10)),
        spriteSize: new kakao.maps.Size(24 * 10, 36 * 4),
      }),
      ...markerStyle,
      zIndex: isSelected ? 100 : markerStyle?.zIndex ?? 10,
    })

    const { title, places } = overlayInfo
    // CustomOverlay로 마커 위에 툴팁 표시
    const overlayContent = document.createElement("div")
    overlayContent.style.cssText = `
      position: absolute;
      bottom: 45px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border: 2px solid #333;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      pointer-events: none;
    `
    overlayContent.innerHTML = `
      <b>${title}</b><br/>
      <small style="color: #666;">${places.length}개 장소</small>
    `

    overlay.current = new kakao.maps.CustomOverlay({
      content: overlayContent,
      position: latlng,
      xAnchor: 0.5,
      yAnchor: 1,
      zIndex: 1000,
    })

    kakao.maps.event.addListener(marker.current, "mouseover", () => {
      if (!isSelected) {
        overlay.current?.setMap(map)
      }
    })
    kakao.maps.event.addListener(marker.current, "mouseout", () => {
      // 선택되지 않은 마커만 mouseout 시 닫기
      if (!isSelected) {
        overlay.current?.setMap(null)
      }
    })

    // 클릭 이벤트 핸들러 추가
    if (onClick) {
      kakao.maps.event.addListener(marker.current, "click", () => {
        // 클릭 시 오버레이 열기
        overlay.current?.setMap(map)
        onClick()
      })
    }

    // unmount 되면 map에서 마커 제거.
    return () => {
      overlay.current?.setMap(null)
      marker.current?.setMap(null)
    }
  }, [map, position, clusterIndex, markerStyle, onClick, overlayInfo])

  // isSelected 상태 변경에 따라 CustomOverlay 열기/닫기
  useEffect(() => {
    if (!map) return

    if (isSelected) {
      overlay.current?.setMap(map)
    } else {
      overlay.current?.setMap(null)
    }
  }, [map, isSelected])

  return null
}

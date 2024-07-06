import { useContext, useEffect, useRef } from "react"

import { QuestPlace } from "@/lib/models/quest"

import { MapContext } from "../Map"

type MarkerStyle = Omit<kakao.maps.MarkerOptions, "map" | "center" | "radius">

export interface Props {
  position: { lat: number; lng: number } | undefined
  clusterIndex: number
  overlayInfo: {
    title: string
    places: QuestPlace[]
  }
  markerStyle?: MarkerStyle
}

export default function ClusterMarker({ position, clusterIndex, overlayInfo, markerStyle }: Props) {
  const { map } = useContext(MapContext)
  const marker = useRef<kakao.maps.Marker>()

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
    })

    const { title, places } = overlayInfo
    // 마커에 커서가 오버됐을 인포윈도우로 건물정보 / 장소목록을 노출합니다.
    const iwContent = `<div style="padding:5px;">
          <b>${title}</b> <small>(${places.length}개 장소)</small>
          <br />
          <p style="white-space:pre;">${places.map((p) => p.name).join("\n")}</p>
        </div>`

    const infowindow = new kakao.maps.InfoWindow({ content: iwContent })
    kakao.maps.event.addListener(marker.current, "mouseover", () => infowindow.open(map, marker.current))
    kakao.maps.event.addListener(marker.current, "mouseout", () => infowindow.close())

    // unmount 되면 map에서 circle을 제거.
    return () => {
      marker.current?.setMap(null)
    }
  }, [map, position, clusterIndex, markerStyle])

  return null
}

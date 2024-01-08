"use client"

import { useParams } from "next/navigation"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import { useMediaQuery } from "react-responsive"

import { useQuest } from "@/lib/apis/api"

import { useModal } from "@/hooks/useModal"

import * as S from "./page.style"

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>()
  const { data } = useQuest({ id })
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const map = useRef<kakao.maps.Map>()
  const { openModal } = useModal()

  useEffect(() => {
    if (!scriptLoaded) return
    if (!data) return
    kakao.maps.load(initializeMap)
  }, [data, scriptLoaded])

  function initializeMap() {
    if (!data) return

    const mapContainer = document.getElementById("map")!
    const coords = data.buildings.map((b) => b.location)
    const center = {
      lat: coords.reduce((acc, c) => acc + c.lat, 0) / coords.length,
      lng: coords.reduce((acc, c) => acc + c.lng, 0) / coords.length,
    }
    const options = {
      center: new kakao.maps.LatLng(center.lat, center.lng), // 지도의 중심좌표.
      level: 3, // 지도의 레벨(확대, 축소 정도)
    }
    map.current = new kakao.maps.Map(mapContainer, options) //지도 생성 및 객체 리턴

    coords.forEach((c, i) => addMarker(map.current!, new kakao.maps.LatLng(c.lat, c.lng), i))
  }

  function addMarker(map: kakao.maps.Map, coords: kakao.maps.LatLng, index: number) {
    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    const markerImage = new kakao.maps.MarkerImage(
      `http://localhost:3066/marker_sprite.png`,
      new kakao.maps.Size(24, 36),
      {
        offset: new kakao.maps.Point(12, 36),
        spriteOrigin: new kakao.maps.Point(24 * index, 0),
        spriteSize: new kakao.maps.Size(24 * 12, 36),
      },
    )

    // 마커를 생성합니다
    const marker = new kakao.maps.Marker({
      position: coords,
      image: markerImage, // 마커이미지 설정
    })

    // 마커 클릭 시 바텀 시트를 열어줍니다
    kakao.maps.event.addListener(marker, "click", function () {
      // 윗쪽 공간의 중심에 마커를 위치시킵니다.
      map.setCenter(coords)
      // 바텀시트를 엽니다.
      openModal({ type: "BuildingDetailSheet", props: {} })
    })

    marker.setMap(map)
  }

  return (
    <S.Page size={isMobile ? "small" : "large"}>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
        onLoad={() => setScriptLoaded(true)}
      />
      <S.Map id="map" />
    </S.Page>
  )
}

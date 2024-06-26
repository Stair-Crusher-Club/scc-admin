"use client"

import { useParams } from "next/navigation"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import { useMediaQuery } from "react-responsive"
import { useQueryClient } from "@tanstack/react-query";

import { useQuest } from "@/lib/apis/api"
import { QuestBuilding } from "@/lib/models/quest"

import { Contents, Header } from "@/components/layout"
import { useModal } from "@/hooks/useModal"

import * as S from "./page.style"

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: quest } = useQuest({ id })
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map>()
  const markersRef = useRef<kakao.maps.Marker[]>([])
  const { openModal, closeModal, closeAll } = useModal()
  const openedModal = useRef<string>()
  const me = useRef<kakao.maps.Marker>()
  const queryClient = useQueryClient()

  // 데이터가 바뀌어도 초기화는 한 번만 합니다.
  useEffect(() => {
    if (!scriptLoaded) return
    if (!quest) return
    kakao.maps.load(() => {
      closeAll()
      initializeMap()
      drawMarkers()
    })
  }, [quest?.id, scriptLoaded, isMobile])

  // 데이터가 바뀌면 마커를 다시 그립니다
  useEffect(() => {
    if (!scriptLoaded) return
    if (!quest) return
    if (!mapRef.current) return // 초기화 되었는지 확인합니다
    drawMarkers()
  }, [quest, scriptLoaded])

  // 10초마다 내 위치를 업데이트합니다.
  useEffect(() => {
    drawMyLocationMarker()
    const interval = setInterval(drawMyLocationMarker, 10 * 1000)
    return () => clearInterval(interval)
  }, [])

  // 10초마다 퀘스트 진행 상황을 갱신합니다.
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["@quests", id] })
    }, 5 * 1000)
    return () => clearInterval(interval)
  }, [quest?.id])

  function initializeMap() {
    if (!quest) return

    const mapContainer = document.getElementById("map")!
    const center = getCenterOf(quest.buildings)
    const options = {
      center: center, // 지도의 중심좌표.
      level: 3, // 지도의 레벨(확대, 축소 정도)
    }

    mapRef.current = new kakao.maps.Map(mapContainer, options)
  }

  function drawMarkers() {
    if (!quest) return
    // remove previous markers
    markersRef.current.forEach((m) => m.setMap(null))

    // redraw markers
    const markers = quest.buildings.map(createBuildingMarker)
    markersRef.current = markers
    markers.map((m) => m.setMap(mapRef.current!))
  }

  function drawMyLocationMarker() {
    // HTML5의 geolocation으로 사용할 수 있는지 확인합니다
    if (!navigator.geolocation) return

    // GeoLocation을 이용해서 접속 위치를 얻어옵니다
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude // 위도
      const lon = position.coords.longitude // 경도

      const locPosition = new kakao.maps.LatLng(lat, lon) // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다

      // 내 위치를 표시합니다
      me.current?.setMap(null)
      me.current = new kakao.maps.Marker({
        position: locPosition,
        image: new kakao.maps.MarkerImage("/me.png", new kakao.maps.Size(16, 16), {
          offset: new kakao.maps.Point(8, 8),
        }),
      })
      me.current.setMap(mapRef.current!)
    })
  }

  function createBuildingMarker(building: QuestBuilding, index: number) {
    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    const markerImage = new kakao.maps.MarkerImage(
      building.places.every((p) => p.isConquered || p.isClosed || p.isNotAccessible)
        ? `/marker_sprite_done.png`
        : `/marker_sprite.png`,
      new kakao.maps.Size(24, 36),
      {
        offset: new kakao.maps.Point(12, 36),
        spriteOrigin: new kakao.maps.Point(24 * (index % 10), 36 * Math.floor(index / 10)),
        spriteSize: new kakao.maps.Size(24 * 10, 36 * 4),
      },
    )

    // 마커를 생성합니다
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(building.location.lat, building.location.lng),
      image: markerImage, // 마커이미지 설정
    })

    // 마커 클릭 시 바텀 시트를 열어줍니다
    kakao.maps.event.addListener(marker, "click", () => onMarkerClick(building))

    return marker
  }

  function getCenterOf(buildings: QuestBuilding[]) {
    const coords = buildings.map((b) => b.location)
    const center = {
      lat: coords.reduce((acc, c) => acc + c.lat, 0) / coords.length,
      lng: coords.reduce((acc, c) => acc + c.lng, 0) / coords.length,
    }
    return new kakao.maps.LatLng(center.lat, center.lng)
  }

  function onMarkerClick(building: QuestBuilding) {
    const map = mapRef.current
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
        props: { building, questId: quest?.id ?? "" },
        events: { onClose: () => onModalClose(building) },
      })
    } else {
      // 지도 중앙에 마커를 위치시킵니다.
      const focusPoint = getFocusedCenter(building)
      map.panTo(focusPoint!)

      // 우측에 시트를 엽니다.
      openedModal.current = openModal({
        type: "BuildingDetailSheetDesktop",
        props: { building, questId: quest?.id ?? "" },
        events: { onClose: () => onModalClose(building) },
      })
    }
  }

  function onModalClose(building: QuestBuilding) {
    const map = mapRef.current
    if (!map) return

    // 모달이 닫히면 빌딩을 중앙으로 이동합니다
    const buildingCenter = new kakao.maps.LatLng(building.location.lat, building.location.lng)
    map.panTo(buildingCenter)

    openedModal.current = undefined
  }

  /**
   * 윗쪽 300px의 공간에 마커를 센터로 위치시키려면
   * 화면 전체를 차지하는 지도의 센터가 어디여야 하는지 계산합니다.
   */
  function getFocusedCenter(building: QuestBuilding) {
    const map = mapRef.current
    if (!map) return
    if (!mapElement.current) return

    const rect = mapElement.current.getClientRects()[0]
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

  function openSummary() {
    openModal({ type: "QuestSummarySheet", props: { questId: quest?.id ?? "" } })
  }

  return (
    <>
      <Header title={quest?.name} />
      <Contents>
        <Script
          id="kakao-map-script"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
          onReady={() => setScriptLoaded(true)}
          onError={(e) => alert(`지도를 불러올 수 없습니다.`)}
        />
        <S.Map id="map" ref={mapElement} />
        <S.SummaryButton onClick={openSummary}>개요</S.SummaryButton>
        {!scriptLoaded && <S.Loading>지도를 불러오는 중입니다...</S.Loading>}
      </Contents>
    </>
  )
}

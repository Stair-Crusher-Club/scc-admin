"use client"

import { useRouter } from "next/navigation"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import { useMediaQuery } from "react-responsive"

import { createRegion, useRegions } from "@/lib/apis/api"

import { useModal } from "@/hooks/useModal"

import { FIXED_REGIONS } from "./data"
import * as S from "./page.style"

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY

export default function Page() {
  const router = useRouter()
  const mapElement = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map>()
  const shapesRef = useRef<kakao.maps.Polygon[]>([])
  const newShape = useRef<kakao.maps.Polygon>()
  const { data, refetch } = useRegions()
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 800 })
  const regions = data ?? []
  const { openModal, closeAll } = useModal()

  // 데이터가 바뀌어도 초기화는 한 번만 합니다.
  useEffect(() => {
    if (!scriptLoaded) return
    kakao.maps.load(() => {
      console.log("map loaded")
      closeAll()
      initializeMap()
      drawRegions()
    })
  }, [scriptLoaded, isMobile])

  useEffect(() => {
    if (!scriptLoaded) return
    drawRegions()
  }, [data])

  function initializeMap() {
    const mapContainer = mapElement.current!

    const options = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567), // 적당히 초기 설정
    }

    mapRef.current = new kakao.maps.Map(mapContainer, options)

    // 전체 영역이 전부 표시되도록
    const bounds = new kakao.maps.LatLngBounds()
    ;[...FIXED_REGIONS, ...regions].forEach((r) =>
      r.boundaryVertices.forEach((v) => bounds.extend(new kakao.maps.LatLng(v.lat, v.lng))),
    )
    mapRef.current.setBounds(bounds)
  }

  function drawRegions() {
    // remove previous markers
    shapesRef.current.forEach((s) => s.setMap(null))
    shapesRef.current = []

    // redraw markers
    shapesRef.current = [...FIXED_REGIONS, ...regions].map((region) => {
      const path = region.boundaryVertices.map((v) => new kakao.maps.LatLng(v.lat, v.lng))
      const polygon = new kakao.maps.Polygon({
        map: mapRef.current,
        path,
        strokeWeight: 3,
        strokeColor: "#39f",
        strokeOpacity: 1,
        fillColor: "#39f",
        fillOpacity: 0.2,
      })

      polygon.setMap(mapRef.current!)

      // 라벨을 표시할 bound rect의 중심점을 구한다
      const center = getCenterOf(region.boundaryVertices)

      const overlay = new kakao.maps.CustomOverlay({
        map: mapRef.current!,
        content: `<div style="padding:5px;background:rgba(255,255,255,0.5)"><b>${region.name}</b></div>`,
        position: center,
        zIndex: 3,
      })

      // 폴리곤 클릭 시 삭제 가능하도록?
      // kakao.maps.event.addListener(polygon, "click", () => openEditor())

      return polygon
    })
  }

  function selectHowToCreateRegion() {
    openModal({ type: "RegionDraw", props: { onSelect: handleNewRegionSelected } })
  }
  async function createNewRegion({ name, vertices }: { name: string; vertices: { lat: number; lng: number }[] }) {
    await createRegion({ name, boundaryVertices: vertices })
  }

  function handleNewRegionSelected(name: string | null, vertices: { lat: number; lng: number }[]) {
    const path = vertices.map((v) => new kakao.maps.LatLng(v.lat, v.lng))
    const polygon = new kakao.maps.Polygon({
      map: mapRef.current,
      path,
      strokeWeight: 3,
      strokeColor: "#f43",
      strokeOpacity: 1,
      fillColor: "#f43",
      fillOpacity: 0.2,
    })

    polygon.setMap(mapRef.current!)

    // 라벨을 표시할 bound rect의 중심점을 구한다
    const center = getCenterOf(vertices)
    const overlay = new kakao.maps.CustomOverlay({
      map: mapRef.current!,
      content: `<div style="padding:5px;background:rgba(255,255,255,0.5)"><b>${name}</b></div>`,
      position: center,
      zIndex: 3,
    })
    const newBounds = mapRef.current!.getBounds().extend(center)
    mapRef.current!.setBounds(newBounds!)
    newShape.current = polygon
    openModal({
      type: "RegionCreate",
      props: {
        defaultName: name ?? undefined,
        onConfirm: async (name) => {
          await createNewRegion({ name, vertices })
          polygon.setMap(null)
          refetch()
        },
        onCancel: () => {
          polygon.setMap(null)
          overlay.setMap(null)
        },
      },
    })
  }

  function showList() {
    openModal({ type: "RegionList" })
  }

  return (
    <S.Page>
      <S.Header>
        오픈 지역 관리<S.PageAction onClick={selectHowToCreateRegion}>오픈 지역 추가</S.PageAction>
      </S.Header>
      <Script
        id="kakao-map-script"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`}
        onReady={() => setScriptLoaded(true)}
        onError={(e) => alert(`지도를 불러올 수 없습니다.`)}
      />
      {!scriptLoaded && <S.Loading>지도를 불러오는 중입니다...</S.Loading>}
      <S.Map id="map" ref={mapElement} />
      <S.ListButton onClick={showList}>목록 보기</S.ListButton>
    </S.Page>
  )
}

function getCenterOf(vertices: { lat: number; lng: number }[]) {
  const bounds = new kakao.maps.LatLngBounds()
  vertices.forEach((v) => bounds.extend(new kakao.maps.LatLng(v.lat, v.lng)))
  const centerLat = (bounds.getNorthEast().getLat() + bounds.getSouthWest().getLat()) / 2
  const centerLng = (bounds.getNorthEast().getLng() + bounds.getSouthWest().getLng()) / 2
  return new kakao.maps.LatLng(centerLat, centerLng)
}

"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { createRegion, useRegions } from "@/lib/apis/api"

import Map from "@/components/Map"
import { Polygon } from "@/components/Map/components"
import { Contents } from "@/components/layout"
import { PageActions } from "@/components/page-actions"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/useModal"

import { FIXED_REGIONS } from "../data"

export default function RegionDraw() {
  const router = useRouter()
  const { data, refetch } = useRegions()
  const regions = data ?? []
  const { openModal } = useModal()
  const [map, setMap] = useState<kakao.maps.Map>()
  const intialized = useRef(false)
  const [drawingPoints, setDrawingPoints] = useState<{ lat: number; lng: number }[]>([])

  useEffect(() => {
    // 퀘스트 업데이트 시마다 센터가 변경되지 않게 처리
    if (intialized.current) return
    // 퀘스트 정보와 지도를 둘 다 불러와야 초기화 가능
    if (!data || !map) return
    initializeMap(map)
    intialized.current = true
  }, [regions.length, map])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [drawingPoints])

  function handleKeyDown(e: KeyboardEvent) {
    console.log("e.metaKey", e.metaKey, "e.key", e.key)
    if (e.metaKey && e.key === "z") {
      console.log("undo")
      undo()
    }
  }
  function undo() {
    console.log(drawingPoints.length)
    if (drawingPoints.length === 0) return
    setDrawingPoints((prev) => [...prev.slice(0, -1)])
  }

  function initializeMap(map: kakao.maps.Map) {
    // 전체 영역이 전부 표시되도록
    const bounds = new kakao.maps.LatLngBounds()
    ;[...FIXED_REGIONS, ...regions].forEach((r) =>
      r.boundaryVertices.forEach((v) => bounds.extend(new kakao.maps.LatLng(v.lat, v.lng))),
    )
    map.setBounds(bounds)

    kakao.maps.event.addListener(map, "click", (e: kakao.maps.event.MouseEvent) => handleClick(e.latLng))
  }

  function handleClick(latLng: kakao.maps.LatLng) {
    setDrawingPoints((prev) => [...prev, { lat: latLng.getLat(), lng: latLng.getLng() }])
  }

  function confirmCreate() {
    map?.panTo(getCenterOf(drawingPoints))
    openModal({
      type: "RegionCreate",
      props: {
        defaultName: undefined,
        onConfirm: async (name) => {
          await createNewRegion({ name, vertices: drawingPoints })
          refetch()
          router.back()
        },
      },
    })
  }

  async function createNewRegion({ name, vertices }: { name: string; vertices: { lat: number; lng: number }[] }) {
    await createRegion({ name, boundaryVertices: vertices })
  }

  return (
    <Contents>
      <PageActions>
        <Button onClick={() => router.back()} size="sm" variant="outline">취소</Button>
        <Button onClick={confirmCreate} size="sm" disabled={drawingPoints.length < 3}>영역 생성</Button>
      </PageActions>
      <div className="relative w-full h-[calc(100vh-120px)]">
        <Map id="map" initializeOptions={{ center: { lat: 37.566826, lng: 126.9786567 } }} onInit={setMap}>
            {[...FIXED_REGIONS, ...regions].map((region) => (
              <Polygon
                key={region.id}
                points={region.boundaryVertices}
                style={{ strokeWeight: 3, strokeColor: "#39f", strokeOpacity: 1, fillColor: "#39f", fillOpacity: 0.2 }}
                label={region.name}
              />
            ))}
            <Polygon
              points={drawingPoints}
              style={{ strokeWeight: 3, strokeColor: "#f43", strokeOpacity: 1, fillColor: "#f43", fillOpacity: 0.2 }}
            />
        </Map>
      </div>
    </Contents>
  )
}

function getCenterOf(vertices: { lat: number; lng: number }[]) {
  const bounds = new kakao.maps.LatLngBounds()
  vertices.forEach((v) => bounds.extend(new kakao.maps.LatLng(v.lat, v.lng)))
  const centerLat = (bounds.getNorthEast().getLat() + bounds.getSouthWest().getLat()) / 2
  const centerLng = (bounds.getNorthEast().getLng() + bounds.getSouthWest().getLng()) / 2
  return new kakao.maps.LatLng(centerLat, centerLng)
}

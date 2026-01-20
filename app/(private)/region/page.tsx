"use client"

import { useEffect, useRef, useState } from "react"

import { createRegion, useRegions } from "@/lib/apis/api"

import Map from "@/components/Map"
import { Polygon } from "@/components/Map/components"
import { Contents } from "@/components/layout"
import { PageActions } from "@/components/page-actions"
import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/useModal"

import { FIXED_REGIONS } from "./data"

export default function Page() {
  const mapRef = useRef<kakao.maps.Map>()
  const newShape = useRef<kakao.maps.Polygon>()
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

  function initializeMap(map: kakao.maps.Map) {
    // 전체 영역이 전부 표시되도록
    const bounds = new kakao.maps.LatLngBounds()
    ;[...FIXED_REGIONS, ...regions].forEach((r) =>
      r.boundaryVertices.forEach((v) => bounds.extend(new kakao.maps.LatLng(v.lat, v.lng))),
    )
    map.setBounds(bounds)
  }

  function selectHowToCreateRegion() {
    openModal({ type: "RegionDraw", props: { onSelect: handleNewRegionSelected } })
  }
  async function createNewRegion({ name, vertices }: { name: string; vertices: { lat: number; lng: number }[] }) {
    await createRegion({ name, boundaryVertices: vertices })
  }

  function handleNewRegionSelected(name: string | null, vertices: { lat: number; lng: number }[]) {
    setDrawingPoints(vertices)

    openModal({
      type: "RegionCreate",
      props: {
        defaultName: name ?? undefined,
        onConfirm: async (name) => {
          await createNewRegion({ name, vertices })
          refetch()
          setDrawingPoints([])
        },
      },
    })
  }

  function showList() {
    openModal({ type: "RegionList" })
  }

  return (
    <Contents>
      <PageActions>
        <Button onClick={selectHowToCreateRegion} size="sm">오픈 지역 추가</Button>
        <Button onClick={showList} size="sm" variant="outline">목록 보기</Button>
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

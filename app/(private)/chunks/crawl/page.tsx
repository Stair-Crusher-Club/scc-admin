"use client"

import { useRouter } from "next/navigation"
import clip from "polygon-clipping"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { LatLng } from "@/lib/models/common"

import Map from "@/components/Map"
import { Polygon } from "@/components/Map/components"
import { Contents, Header } from "@/components/layout"

import { useCrawling } from "../query"

type CrawlingStatus = "WAITING" | "CRAWLING" | "DONE"
interface Chunk {
  polygon: clip.Polygon
  status: CrawlingStatus
}

interface FormValues {
  points: { lat: number; lng: number }[]
}
export default function CrawlPage() {
  const [status, setCrawlingStatus] = useState<CrawlingStatus>("WAITING")
  const [chunks, setChunks] = useState<Chunk[]>([])
  const form = useForm<FormValues>({ defaultValues: { points: [] } })
  const crawling = useCrawling()

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function handleKeyDown(e: KeyboardEvent) {
    if (status === "CRAWLING") return
    if ((e.metaKey || e.ctrlKey) && e.key === "z") {
      e.preventDefault()
      if (form.watch("points").length === 0) return
      form.setValue("points", [...form.watch("points").slice(0, -1)])
      makeChunks()
    }
  }

  function initializeMap(map: kakao.maps.Map) {
    kakao.maps.event.addListener(map, "click", (e: kakao.maps.event.MouseEvent) => handleClick(e.latLng))
  }

  function handleClick(latLng: kakao.maps.LatLng) {
    if (status === "CRAWLING") return
    if (status === "DONE") {
      setChunks([])
    }
    form.setValue("points", [...form.getValues("points"), { lat: latLng.getLat(), lng: latLng.getLng() }])
    makeChunks()
  }

  function makeChunks() {
    const points = form.watch("points")
    const polygon: clip.Polygon = [points.map((p) => [p.lng, p.lat] as clip.Pair)]
    const chunks = chunkify(points)
    // chunks 중 겹친 영역이 있는 것만 남긴다
    const validChunks = chunks.filter((chunk) => {
      const intersection = clip.intersection(chunk, polygon)
      return intersection.length > 0
    })

    setChunks(validChunks.map((p) => ({ polygon: p, status: "WAITING" })))
  }

  async function startCrawl() {
    setCrawlingStatus("CRAWLING")
    for (const chunk of chunks) {
      const boundary = chunk.polygon[0].map((c) => ({ lng: c[0], lat: c[1] }))
      setChunks((prevChunks) =>
        prevChunks.map((prevChunk) =>
          prevChunk.polygon === chunk.polygon ? { ...prevChunk, status: "CRAWLING" } : prevChunk,
        ),
      )
      await crawling.mutateAsync(boundary)

      // update chunk status
      setChunks((prevChunks) =>
        prevChunks.map((prevChunk) =>
          prevChunk.polygon === chunk.polygon ? { ...prevChunk, status: "DONE" } : prevChunk,
        ),
      )
    }
    setCrawlingStatus("DONE")
    form.setValue("points", [])
  }

  return (
    <>
      <Header title="장소 정보 가져오기">
        <Header.ActionButton onClick={startCrawl}>이 지역 장소 정보 가져오기</Header.ActionButton>
      </Header>
      <Contents.Columns>
        <Map id="map" initializeOptions={{ center: { lat: 37.566826, lng: 126.9786567 } }} onInit={initializeMap}>
          <Polygon points={form.watch("points")} forDrawing />
          {chunks.map((c, i) => (
            <Polygon
              key={i}
              points={c.polygon[0].map((p) => ({ lat: p[1], lng: p[0] }))}
              style={{
                fillColor: c.status === "CRAWLING" ? "yellow" : "green",
                fillOpacity: c.status === "WAITING" ? 0 : 0.3,
                strokeColor: "#000",
                strokeStyle: "dashed",
                strokeOpacity: status === "WAITING" ? 0.1 : 0.4,
              }}
            />
          ))}
        </Map>
      </Contents.Columns>
    </>
  )
}

function chunkify(points: LatLng[]): clip.Polygon[] {
  // 서울 기준, 약
  // 위도 0.00001도 당 1.11m : 1도에 111km
  // 경도 0.00001도 당 0.88m : 1도에 88km
  // 인 것을 기준으로 대충 청크를 나눈다.
  const bounds = new kakao.maps.LatLngBounds()
  points.forEach((p) => {
    bounds.extend(new kakao.maps.LatLng(p.lat, p.lng))
  })
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()

  const boundHeight = (ne.getLat() - sw.getLat()) * 111000
  const boundWidth = (ne.getLng() - sw.getLng()) * 88000

  const rowCount = boundHeight < 120 * 2 ? Math.ceil(boundHeight / 120) : Math.round(boundHeight / 120)
  const colCount = boundWidth < 120 * 2 ? Math.ceil(boundWidth / 120) : Math.round(boundWidth / 120)

  const chunkHeight = boundHeight / rowCount
  const chunkWidth = boundWidth / colCount

  const chunks: clip.Polygon[] = []
  for (var i = 0; i < rowCount; i++) {
    for (var j = 0; j < colCount; j++) {
      const lat1 = sw.getLat() + (i * chunkHeight) / 111000
      const lat2 = sw.getLat() + ((i + 1) * chunkHeight) / 111000
      const lng1 = sw.getLng() + (j * chunkWidth) / 88000
      const lng2 = sw.getLng() + ((j + 1) * chunkWidth) / 88000

      const polygon: clip.Polygon = [
        [
          [lng1, lat1],
          [lng2, lat1],
          [lng2, lat2],
          [lng1, lat2],
          [lng1, lat1],
        ],
      ]

      chunks.push(polygon)
    }
  }

  return chunks
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

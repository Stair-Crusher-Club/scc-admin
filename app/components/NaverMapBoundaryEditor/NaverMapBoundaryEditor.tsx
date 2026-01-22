"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { BoundaryData, BoundaryPoint, NaverMapBoundaryEditorProps } from "./types"
import { pointsToWkt, wktToPoints } from "@/lib/utils/wkt"
import { calculatePolygonCentroid } from "@/lib/utils/geometry"

export default function NaverMapBoundaryEditor({
  initialCenter = { lat: 37.5665, lng: 126.978 }, // Seoul City Hall
  initialBoundary,
  buildingMarkerLocation,
  onBoundaryChange,
  height = "500px",
  disabled = false,
}: NaverMapBoundaryEditorProps) {
  // State management
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [points, setPoints] = useState<BoundaryPoint[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Refs for map objects
  const markersRef = useRef<any[]>([])
  const buildingMarkerRef = useRef<any>(null)
  const polylineRef = useRef<any>(null)
  const polygonRef = useRef<any>(null)
  const clickListenerRef = useRef<any>(null)

  // Initialize map on mount
  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) return

    // Check if Naver Maps is loaded
    if (typeof naver === 'undefined' || !naver.maps) {
      console.error("Naver Maps is not loaded")
      return
    }

    const center = new naver.maps.LatLng(initialCenter.lat, initialCenter.lng)
    const map = new naver.maps.Map(mapContainer.current, {
      center,
      zoom: 17,
      minZoom: 10,
      maxZoom: 21,
    })

    mapRef.current = map

    // Parse initial boundary if provided
    if (initialBoundary) {
      try {
        const parsedPoints = wktToPoints(initialBoundary)
        setPoints(parsedPoints)
      } catch (error) {
        console.error("Failed to parse initial boundary:", error)
        toast.error("초기 경계 파싱 실패")
      }
    }

    return () => {
      // Cleanup
      if (clickListenerRef.current) {
        naver.maps.Event.removeListener(clickListenerRef.current)
      }
      if (buildingMarkerRef.current) {
        buildingMarkerRef.current.setMap(null)
        buildingMarkerRef.current = null
      }
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [])

  // Render building marker
  useEffect(() => {
    if (!mapRef.current || !buildingMarkerLocation) {
      // Clear existing building marker if location is removed
      if (buildingMarkerRef.current) {
        buildingMarkerRef.current.setMap(null)
        buildingMarkerRef.current = null
      }
      return
    }

    // Clear existing building marker
    if (buildingMarkerRef.current) {
      buildingMarkerRef.current.setMap(null)
    }

    // Create building marker with distinct appearance
    const buildingMarker = new naver.maps.Marker({
      position: new naver.maps.LatLng(buildingMarkerLocation.lat, buildingMarkerLocation.lng),
      map: mapRef.current,
      icon: {
        content: `<div style="
          width: 36px;
          height: 36px;
          background-color: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 3px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
          font-weight: bold;
          font-family: sans-serif;
        ">🏢</div>`,
        anchor: new naver.maps.Point(18, 18),
      },
      title: "건물 위치",
      zIndex: 1000, // Higher z-index to appear above other markers
    })

    buildingMarkerRef.current = buildingMarker
  }, [buildingMarkerLocation])

  // Map click handler for adding points
  useEffect(() => {
    if (!mapRef.current || !isDrawing || disabled) {
      // Remove listener if exists
      if (clickListenerRef.current) {
        naver.maps.Event.removeListener(clickListenerRef.current)
        clickListenerRef.current = null
      }
      return
    }

    const listener = naver.maps.Event.addListener(mapRef.current, "click", (e: any) => {
      const latlng = e.coord
      const newPoint: BoundaryPoint = {
        lat: latlng.lat(),
        lng: latlng.lng(),
      }
      setPoints((prev) => [...prev, newPoint])
    })

    clickListenerRef.current = listener

    return () => {
      if (clickListenerRef.current) {
        naver.maps.Event.removeListener(clickListenerRef.current)
        clickListenerRef.current = null
      }
    }
  }, [isDrawing, disabled])

  // Render markers and polygon on map
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Clear existing polyline/polygon
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }
    if (polygonRef.current) {
      polygonRef.current.setMap(null)
      polygonRef.current = null
    }

    if (points.length === 0) {
      onBoundaryChange(null)
      return
    }

    // Add markers for each point
    points.forEach((point, index) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(point.lat, point.lng),
        map: mapRef.current,
        icon: {
          content: `<div style="
            width: 24px;
            height: 24px;
            background-color: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: white;
            font-weight: bold;
            font-family: sans-serif;
          ">${index + 1}</div>`,
          anchor: new naver.maps.Point(12, 12),
        },
      })
      markersRef.current.push(marker)
    })

    // Draw polyline or polygon
    const path = points.map((p) => new naver.maps.LatLng(p.lat, p.lng))

    if (points.length >= 3) {
      // Draw filled polygon
      const polygon = new naver.maps.Polygon({
        map: mapRef.current,
        paths: [path],
        fillColor: "#3b82f6",
        fillOpacity: 0.2,
        strokeColor: "#3b82f6",
        strokeWeight: 3,
      })
      polygonRef.current = polygon

      // Generate boundary data
      try {
        const wkt = pointsToWkt(points)
        const center = calculatePolygonCentroid(points)
        const boundaryData: BoundaryData = {
          points,
          wkt,
          center,
        }
        onBoundaryChange(boundaryData)
      } catch (error) {
        console.error("Failed to generate boundary data:", error)
        toast.error("경계 생성 실패")
        onBoundaryChange(null)
      }
    } else if (points.length === 2) {
      // Draw polyline
      const polyline = new naver.maps.Polyline({
        map: mapRef.current,
        path,
        strokeColor: "#3b82f6",
        strokeWeight: 3,
        strokeStyle: "dash",
      })
      polylineRef.current = polyline
      onBoundaryChange(null)
    } else {
      onBoundaryChange(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])

  // Actions
  const handleStartDrawing = () => {
    if (points.length > 0) {
      if (!confirm("기존 경계를 초기화하고 새로 그리시겠습니까?")) {
        return
      }
      setPoints([])
    }
    setIsDrawing(true)
  }

  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (!confirm("모든 점을 삭제하시겠습니까?")) return
    setPoints([])
    setIsDrawing(false)
  }

  const handleComplete = () => {
    if (points.length < 3) {
      toast.error("최소 3개의 점이 필요합니다.")
      return
    }
    setIsDrawing(false)
    toast.success("경계 설정 완료")
  }

  // Error state if Naver Maps not loaded
  if (typeof naver === 'undefined' || !naver.maps) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="p-8 text-center bg-red-50 rounded-md border border-red-200">
          <p className="text-sm text-red-700">지도를 불러올 수 없습니다. 페이지를 새로고침해주세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div ref={mapContainer} style={{ height }} className="w-full rounded-md border border-gray-300 overflow-hidden" />

      <div className="flex flex-col gap-3 p-4 bg-white rounded-md border border-gray-200">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            {isDrawing ? (
              <>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">그리기 모드</Badge>
                <span>지도를 클릭하여 경계를 그리세요</span>
              </>
            ) : points.length >= 3 ? (
              <>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">완료</Badge>
                <span>경계 설정 완료 ({points.length}개 점)</span>
              </>
            ) : (
              <span>시작 버튼을 눌러 경계를 그리세요</span>
            )}
          </div>
          {points.length > 0 && (
            <span className="text-sm font-medium text-gray-600">점: {points.length}개</span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {!isDrawing ? (
            <Button type="button" onClick={handleStartDrawing} disabled={disabled}>
              {points.length > 0 ? "다시 그리기" : "그리기 시작"}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleUndo}
                disabled={points.length === 0}
                variant="outline"
              >
                실행 취소
              </Button>
              <Button type="button" onClick={handleComplete} disabled={points.length < 3}>
                완료
              </Button>
            </>
          )}
          {points.length > 0 && (
            <Button type="button" onClick={handleClear} disabled={disabled} variant="destructive">
              모두 지우기
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

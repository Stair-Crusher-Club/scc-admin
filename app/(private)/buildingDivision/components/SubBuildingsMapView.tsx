"use client"

import { useEffect, useRef } from "react"

import { AdminSubBuildingDTO, LocationDTO } from "@/lib/generated-sources/openapi"
import { wktToPoints } from "@/lib/utils/wkt"

interface SubBuildingsMapViewProps {
  subBuildings: AdminSubBuildingDTO[]
  buildingLocation: LocationDTO
}

// Color palette for different sub-buildings
const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
]

export default function SubBuildingsMapView({
  subBuildings,
  buildingLocation,
}: SubBuildingsMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const polygonsRef = useRef<any[]>([])
  const buildingMarkerRef = useRef<any>(null)
  const infoWindowRef = useRef<any>(null)

  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) return

    // Check if Naver Maps is loaded
    if (typeof naver === "undefined" || !naver.maps) {
      console.error("Naver Maps is not loaded")
      return
    }

    const center = new naver.maps.LatLng(buildingLocation.lat, buildingLocation.lng)
    const map = new naver.maps.Map(mapContainer.current, {
      center,
      zoom: 17,
      minZoom: 10,
      maxZoom: 21,
    })

    mapRef.current = map

    // Add building marker
    const buildingMarker = new naver.maps.Marker({
      position: center,
      map,
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
      zIndex: 1000,
    })

    buildingMarkerRef.current = buildingMarker

    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
        infoWindowRef.current = null
      }
      if (buildingMarkerRef.current) {
        buildingMarkerRef.current.setMap(null)
      }
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [buildingLocation])

  // Render sub-building polygons
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing polygons
    polygonsRef.current.forEach((polygon) => polygon.setMap(null))
    polygonsRef.current = []

    if (subBuildings.length === 0) return

    // Calculate bounds to fit all sub-buildings
    // Initialize with building location
    const buildingLatLng = new naver.maps.LatLng(buildingLocation.lat, buildingLocation.lng)
    const bounds = new naver.maps.LatLngBounds(buildingLatLng, buildingLatLng)

    subBuildings.forEach((subBuilding, index) => {
      try {
        const points = wktToPoints(subBuilding.boundaryWkt)
        const path = points.map((p) => new naver.maps.LatLng(p.lat, p.lng))

        // Extend bounds with this polygon's points
        path.forEach((point) => bounds.extend(point))

        const color = COLORS[index % COLORS.length]

        // Create polygon
        const polygon = new naver.maps.Polygon({
          map: mapRef.current,
          paths: [path],
          fillColor: color,
          fillOpacity: 0.3,
          strokeColor: color,
          strokeWeight: 3,
          strokeOpacity: 0.8,
        })

        // Add click listener to show info
        naver.maps.Event.addListener(polygon, "click", () => {
          // Close previous info window if exists
          if (infoWindowRef.current) {
            infoWindowRef.current.close()
          }

          const infoWindow = new naver.maps.InfoWindow({
            content: `<div style="padding: 10px; font-size: 14px; font-weight: bold; color: ${color};">${subBuilding.subBuildingName}</div>`,
            borderWidth: 2,
            borderColor: color,
            backgroundColor: "white",
            anchorSkew: true,
          })

          infoWindow.open(
            mapRef.current,
            new naver.maps.LatLng(subBuilding.centerLocation.lat, subBuilding.centerLocation.lng)
          )

          infoWindowRef.current = infoWindow
        })

        // Add label at center
        const label = new naver.maps.Marker({
          position: new naver.maps.LatLng(
            subBuilding.centerLocation.lat,
            subBuilding.centerLocation.lng
          ),
          map: mapRef.current,
          icon: {
            content: `<div style="
              background-color: white;
              border: 2px solid ${color};
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 12px;
              font-weight: bold;
              color: ${color};
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              white-space: nowrap;
            ">${subBuilding.subBuildingName}</div>`,
            anchor: new naver.maps.Point(0, 0),
          },
          zIndex: 100,
        })

        polygonsRef.current.push(polygon, label)
      } catch (error) {
        console.error(`Failed to render sub-building ${subBuilding.id}:`, error)
      }
    })

    // Fit bounds to show all polygons
    if (subBuildings.length > 0) {
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 })
    }
  }, [subBuildings, buildingLocation])

  // Error state if Naver Maps not loaded
  if (typeof naver === "undefined" || !naver.maps) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-md">
        <p className="text-gray-500">지도를 불러올 수 없습니다. 페이지를 새로고침해주세요.</p>
      </div>
    )
  }

  return (
    <div>
      <div ref={mapContainer} className="w-full h-[600px] rounded-md border border-gray-300" />

      {subBuildings.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-semibold mb-3">범례</h4>
          <div className="grid grid-cols-2 gap-2">
            {subBuildings.map((subBuilding, index) => (
              <div key={subBuilding.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border-2"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                    borderColor: COLORS[index % COLORS.length],
                    opacity: 0.6,
                  }}
                />
                <span className="text-sm text-gray-700">{subBuilding.subBuildingName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {subBuildings.length === 0 && (
        <div className="mt-4 p-8 text-center text-gray-500 bg-gray-50 rounded-md border border-gray-200">
          SubBuilding이 없습니다. 추가 버튼을 눌러 생성하세요.
        </div>
      )}
    </div>
  )
}

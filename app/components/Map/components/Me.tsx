import { useContext, useEffect, useRef } from "react"

import { MapContext } from "../Map"

interface Props {
  updateInterval?: number
  position?: { lat: number; lng: number } | null
  heading?: number | null
}

export default function Me({ updateInterval = 1000, position: externalPosition, heading }: Props) {
  const { map } = useContext(MapContext)
  const markerRef = useRef<kakao.maps.Marker | null>(null)
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null)
  const coneRef = useRef<HTMLDivElement | null>(null)
  const hasExternalPosition = externalPosition !== undefined
  const useHeadingMode = heading !== undefined

  // Create display element: CustomOverlay (heading mode) or Marker (simple mode)
  useEffect(() => {
    if (!map) return

    if (useHeadingMode) {
      const container = document.createElement("div")
      container.style.cssText = "position: relative; width: 60px; height: 60px; pointer-events: none;"

      const cone = document.createElement("div")
      cone.style.cssText = [
        "position: absolute; width: 60px; height: 60px; top: 50%; left: 50%;",
        "transform: translate(-50%, -50%);",
        "background: conic-gradient(from -30deg, rgba(59, 130, 246, 0.3) 60deg, transparent 60deg);",
        "border-radius: 50%;",
        "display: none;",
      ].join(" ")
      container.appendChild(cone)
      coneRef.current = cone

      const dot = document.createElement("div")
      dot.style.cssText = [
        "position: absolute; top: 50%; left: 50%;",
        "width: 14px; height: 14px;",
        "background: #3B82F6; border: 2.5px solid white; border-radius: 50%;",
        "transform: translate(-50%, -50%);",
        "box-shadow: 0 0 4px rgba(0,0,0,0.3);",
      ].join(" ")
      container.appendChild(dot)

      overlayRef.current = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(0, 0),
        content: container,
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 1,
      })
    } else {
      markerRef.current = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(0, 0),
        image: new kakao.maps.MarkerImage("/me.png", new kakao.maps.Size(16, 16), {
          offset: new kakao.maps.Point(8, 8),
        }),
      })
    }

    return () => {
      markerRef.current?.setMap(null)
      markerRef.current = null
      overlayRef.current?.setMap(null)
      overlayRef.current = null
      coneRef.current = null
    }
  }, [map, useHeadingMode])

  // Update heading cone rotation
  useEffect(() => {
    if (!coneRef.current) return
    if (heading != null) {
      coneRef.current.style.display = ""
      coneRef.current.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`
    } else {
      coneRef.current.style.display = "none"
    }
  }, [heading])

  // Internal position polling (fallback when no external position provided)
  useEffect(() => {
    if (hasExternalPosition) return
    if (!map) return

    function update() {
      navigator.geolocation?.getCurrentPosition((pos) => {
        setDisplayPosition(new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude))
      })
    }

    update()
    const interval = setInterval(update, updateInterval)

    return () => {
      clearInterval(interval)
    }
  }, [map, hasExternalPosition, updateInterval])

  // External position updates
  useEffect(() => {
    if (!hasExternalPosition) return
    if (!map || !externalPosition) return
    setDisplayPosition(new kakao.maps.LatLng(externalPosition.lat, externalPosition.lng))
  }, [externalPosition, map, hasExternalPosition])

  function setDisplayPosition(latlng: kakao.maps.LatLng) {
    if (overlayRef.current) {
      overlayRef.current.setPosition(latlng)
      overlayRef.current.setMap(map!)
    } else if (markerRef.current) {
      markerRef.current.setPosition(latlng)
      markerRef.current.setMap(map!)
    }
  }

  return null
}

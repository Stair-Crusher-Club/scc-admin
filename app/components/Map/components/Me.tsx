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
  const arrowRef = useRef<HTMLDivElement | null>(null)
  const hasExternalPosition = externalPosition !== undefined
  const hasHeading = heading !== undefined

  // Create display element: CustomOverlay (heading mode) or Marker (simple mode)
  useEffect(() => {
    if (!map) return

    if (hasHeading) {
      const container = document.createElement("div")
      container.style.cssText = "position: relative; width: 80px; height: 80px; pointer-events: none;"

      // Heading arrow - SVG triangle, rotates around center (where dot is)
      const arrow = document.createElement("div")
      arrow.style.cssText = [
        "position: absolute; top: 50%; left: 50%;",
        "width: 80px; height: 80px;",
        "transform: translate(-50%, -50%);",
        "display: none;",
      ].join(" ")
      arrow.innerHTML = [
        '<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">',
        '  <polygon points="40,14 33,30 47,30" fill="#EF4444" stroke="white" stroke-width="1.5" />',
        "</svg>",
      ].join("")
      container.appendChild(arrow)
      arrowRef.current = arrow

      // Accuracy ring (semi-transparent red circle, matching me.png)
      const ring = document.createElement("div")
      ring.style.cssText = [
        "position: absolute; top: 50%; left: 50%;",
        "width: 36px; height: 36px;",
        "background: rgba(239, 68, 68, 0.15);",
        "border-radius: 50%;",
        "transform: translate(-50%, -50%);",
      ].join(" ")
      container.appendChild(ring)

      const dot = document.createElement("div")
      dot.style.cssText = [
        "position: absolute; top: 50%; left: 50%;",
        "width: 18px; height: 18px;",
        "background: #EF4444; border: 3px solid white; border-radius: 50%;",
        "transform: translate(-50%, -50%);",
        "box-shadow: 0 0 6px rgba(0,0,0,0.35);",
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
      arrowRef.current = null
    }
  }, [map, hasHeading])

  // Update heading arrow rotation
  useEffect(() => {
    if (!arrowRef.current) return
    if (heading != null) {
      arrowRef.current.style.display = ""
      arrowRef.current.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`
    } else {
      arrowRef.current.style.display = "none"
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

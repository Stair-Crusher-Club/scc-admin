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
  const overlayContainerRef = useRef<HTMLDivElement | null>(null)
  const arrowRef = useRef<HTMLDivElement | null>(null)
  const hasExternalPosition = externalPosition !== undefined
  const hasHeading = heading !== undefined

  // Create display element: CustomOverlay (heading mode) or Marker (simple mode)
  useEffect(() => {
    if (!map) return

    if (hasHeading) {
      const container = document.createElement("div")
      container.style.cssText = "position: relative; width: 80px; height: 80px; pointer-events: none;"
      overlayContainerRef.current = container

      // Heading arrow - SVG triangle, rotates around center (where dot is)
      const arrow = document.createElement("div")
      arrow.style.cssText = [
        "position: absolute; top: 50%; left: 50%;",
        "width: 80px; height: 80px;",
        "transform: translate(-50%, -50%);",
        "display: none;",
        "pointer-events: none;",
      ].join(" ")
      arrow.innerHTML = [
        '<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">',
        '  <polygon points="40,17 33,28 47,28" fill="#EF4444" style="pointer-events: none;" />',
        "</svg>",
      ].join("")
      container.appendChild(arrow)
      arrowRef.current = arrow
      if (heading != null) {
        arrow.style.display = ""
        arrow.style.transform = `translate(-50%, -50%) rotate(${heading}deg)`
      }

      // Accuracy ring (semi-transparent red circle, matching me.png)
      const ring = document.createElement("div")
      ring.style.cssText = [
        "position: absolute; top: 50%; left: 50%;",
        "width: 36px; height: 36px;",
        "background: rgba(239, 68, 68, 0.15);",
        "border-radius: 50%;",
        "transform: translate(-50%, -50%);",
        "pointer-events: none;",
      ].join(" ")
      container.appendChild(ring)

      const dot = document.createElement("div")
      dot.style.cssText = [
        "position: absolute; top: 50%; left: 50%;",
        "width: 22px; height: 22px;",
        "background: #EF4444; border: 3px solid white; border-radius: 50%;",
        "transform: translate(-50%, -50%);",
        "box-shadow: 0 0 6px rgba(0,0,0,0.35);",
        "pointer-events: none;",
      ].join(" ")
      container.appendChild(dot)

      overlayRef.current = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(0, 0),
        content: container,
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 1,
        clickable: false,
      })
    } else {
      markerRef.current = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(0, 0),
        image: new kakao.maps.MarkerImage("/me.png", new kakao.maps.Size(16, 16), {
          offset: new kakao.maps.Point(8, 8),
        }),
        clickable: false,
      })
    }

    return () => {
      markerRef.current?.setMap(null)
      markerRef.current = null
      overlayRef.current?.setMap(null)
      overlayRef.current = null
      overlayContainerRef.current = null
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
      // Kakao의 CustomOverlay 래퍼 div는 clickable:false 옵션을 무시하고 pointer-events:auto로 남아,
      // 뒤에 깔린 Marker의 클릭을 가로챈다. 래퍼를 찾아 pointer-events:none을 강제한다.
      const wrapper = overlayContainerRef.current?.parentElement
      if (wrapper && wrapper.style.pointerEvents !== "none") {
        wrapper.style.pointerEvents = "none"
      }
    } else if (markerRef.current) {
      markerRef.current.setPosition(latlng)
      markerRef.current.setMap(map!)
    }
  }

  return null
}

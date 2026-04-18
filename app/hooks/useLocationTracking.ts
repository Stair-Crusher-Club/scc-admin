"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type TrackingMode = "OFF" | "TRACKING"

interface UseLocationTrackingProps {
  map: kakao.maps.Map | undefined
}

export default function useLocationTracking({ map }: UseLocationTrackingProps) {
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("OFF")
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [watchRetryCount, setWatchRetryCount] = useState(0)
  const trackingModeRef = useRef<TrackingMode>("OFF")
  const positionRef = useRef<{ lat: number; lng: number } | null>(null)
  const geolocationFailedRef = useRef(false)

  // Always watch position (for Me marker display)
  useEffect(() => {
    if (!map) return
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        geolocationFailedRef.current = false
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(newPos)
        positionRef.current = newPos

        if (trackingModeRef.current === "TRACKING") {
          map.panTo(new kakao.maps.LatLng(newPos.lat, newPos.lng))
        }
      },
      (error) => {
        geolocationFailedRef.current = true
        trackingModeRef.current = "OFF"
        setTrackingMode("OFF")
        console.error("Geolocation error:", error)
      },
      { enableHighAccuracy: true, maximumAge: 1000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [map, watchRetryCount])

  // Listen for user interactions to exit tracking
  useEffect(() => {
    if (!map) return

    function handleInteraction() {
      if (trackingModeRef.current === "TRACKING") {
        trackingModeRef.current = "OFF"
        setTrackingMode("OFF")
      }
    }

    kakao.maps.event.addListener(map, "dragstart", handleInteraction)
    kakao.maps.event.addListener(map, "zoom_changed", handleInteraction)
    kakao.maps.event.addListener(map, "click", handleInteraction)

    return () => {
      kakao.maps.event.removeListener(map, "dragstart", handleInteraction)
      kakao.maps.event.removeListener(map, "zoom_changed", handleInteraction)
      kakao.maps.event.removeListener(map, "click", handleInteraction)
    }
  }, [map])

  const toggleTracking = useCallback(() => {
    const current = trackingModeRef.current
    switch (current) {
      case "OFF":
        // Retry watch if geolocation previously failed — browser may re-prompt.
        if (geolocationFailedRef.current) {
          setWatchRetryCount((c) => c + 1)
        }
        trackingModeRef.current = "TRACKING"
        setTrackingMode("TRACKING")
        // Immediately pan to current position
        if (map && positionRef.current) {
          map.panTo(new kakao.maps.LatLng(positionRef.current.lat, positionRef.current.lng))
        }
        break
      case "TRACKING":
        trackingModeRef.current = "OFF"
        setTrackingMode("OFF")
        break
      default:
        current satisfies never
    }
  }, [map])

  const interruptTracking = useCallback(() => {
    trackingModeRef.current = "OFF"
    setTrackingMode("OFF")
  }, [])

  return { trackingMode, position, toggleTracking, interruptTracking }
}

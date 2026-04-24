"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

export type TrackingMode = "OFF" | "TRACKING"

interface UseLocationTrackingProps {
  map: kakao.maps.Map | undefined
}

const GEO_OPTIONS: PositionOptions = { enableHighAccuracy: true, maximumAge: 1000 }

export default function useLocationTracking({ map }: UseLocationTrackingProps) {
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("OFF")
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const trackingModeRef = useRef<TrackingMode>("OFF")
  const watchIdRef = useRef<number | null>(null)
  const mapRef = useRef<kakao.maps.Map | undefined>(map)

  useEffect(() => {
    mapRef.current = map
  }, [map])

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  const startWatch = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return
    clearWatch()

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(newPos)
        if (trackingModeRef.current === "TRACKING" && mapRef.current) {
          mapRef.current.panTo(new kakao.maps.LatLng(newPos.lat, newPos.lng))
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          clearWatch()
        }
        trackingModeRef.current = "OFF"
        setTrackingMode("OFF")
      },
      GEO_OPTIONS,
    )
  }, [clearWatch])

  // Silent attempt on mount so Me marker appears when permission is already granted.
  useEffect(() => {
    if (!map) return
    startWatch()
    return () => clearWatch()
  }, [map, startWatch, clearWatch])

  // Exit tracking when user interacts with the map.
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

  // Must be invoked synchronously inside a user gesture handler so the browser
  // treats the geolocation request as user-initiated and has a chance to re-prompt.
  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("이 브라우저는 위치 기능을 지원하지 않습니다.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setPosition(newPos)
        if (mapRef.current) {
          mapRef.current.panTo(new kakao.maps.LatLng(newPos.lat, newPos.lng))
        }
        trackingModeRef.current = "TRACKING"
        setTrackingMode("TRACKING")
        if (watchIdRef.current === null) startWatch()
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("위치 권한이 거부되었어요. 페이지를 새로고침한 뒤 다시 허용해주세요.")
        } else {
          toast.error("위치를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.")
        }
      },
      GEO_OPTIONS,
    )
  }, [startWatch])

  const toggleTracking = useCallback(() => {
    const current = trackingModeRef.current
    switch (current) {
      case "TRACKING":
        trackingModeRef.current = "OFF"
        setTrackingMode("OFF")
        break
      case "OFF":
        requestLocation()
        break
      default:
        current satisfies never
    }
  }, [requestLocation])

  const interruptTracking = useCallback(() => {
    trackingModeRef.current = "OFF"
    setTrackingMode("OFF")
  }, [])

  return { trackingMode, position, toggleTracking, interruptTracking }
}

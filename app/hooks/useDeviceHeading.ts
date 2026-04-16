"use client"

import { useCallback, useEffect, useState } from "react"

export default function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    function handleOrientation(event: DeviceOrientationEvent) {
      // iOS: webkitCompassHeading gives degrees from magnetic north directly
      const compassHeading = (event as any).webkitCompassHeading as number | undefined
      if (compassHeading != null && !isNaN(compassHeading)) {
        setHeading(compassHeading)
        return
      }

      // Android/others: use alpha only if absolute (relative to Earth, not device)
      if (event.absolute && event.alpha != null) {
        setHeading((360 - event.alpha) % 360)
      }
    }

    // 'deviceorientationabsolute' provides absolute orientation on Android Chrome
    const win = window as any
    if ("ondeviceorientationabsolute" in win) {
      win.addEventListener("deviceorientationabsolute", handleOrientation)
      return () => win.removeEventListener("deviceorientationabsolute", handleOrientation)
    }

    window.addEventListener("deviceorientation", handleOrientation)
    return () => window.removeEventListener("deviceorientation", handleOrientation)
  }, [])

  // iOS 13+ requires explicit permission request from a user gesture
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") return
    if (typeof (DeviceOrientationEvent as any).requestPermission !== "function") return
    try {
      await (DeviceOrientationEvent as any).requestPermission()
    } catch {
      // Permission denied or unavailable
    }
  }, [])

  return { heading, requestPermission }
}

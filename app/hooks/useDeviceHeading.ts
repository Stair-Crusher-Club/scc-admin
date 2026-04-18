"use client"

import { useCallback, useEffect, useState } from "react"

export default function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null)

  // iOS 13+ requires explicit permission request from a user gesture
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") return
    if (typeof (DeviceOrientationEvent as any).requestPermission !== "function") return
    try {
      await (DeviceOrientationEvent as any).requestPermission()
    } catch {
      // Permission denied or unavailable (including non-user-gesture invocations)
    }
  }, [])

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
    const eventName = "ondeviceorientationabsolute" in win ? "deviceorientationabsolute" : "deviceorientation"
    win.addEventListener(eventName, handleOrientation)

    // iOS requires requestPermission() to be called inside a user-gesture handler.
    // Try once at mount (no-op on non-iOS, silent failure on iOS), and retry on the
    // first user interaction so iOS users get the prompt as soon as they touch the page.
    requestPermission()
    const handleFirstGesture = () => {
      requestPermission()
    }
    window.addEventListener("pointerdown", handleFirstGesture, { once: true, capture: true })

    return () => {
      win.removeEventListener(eventName, handleOrientation)
      window.removeEventListener("pointerdown", handleFirstGesture, { capture: true })
    }
  }, [requestPermission])

  return { heading, requestPermission }
}

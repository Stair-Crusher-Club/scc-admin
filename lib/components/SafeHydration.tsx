"use client"

import { useEffect, useState } from "react"

export default function SafeHydration({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div id="safe-hydration" style={{ visibility: mounted ? "visible" : "hidden" }}>
      {children}
    </div>
  )
}

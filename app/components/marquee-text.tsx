"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface Props {
  text: string
  className?: string
}

export function MarqueeText({ text, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [shift, setShift] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const textEl = textRef.current
    if (!container || !textEl) return

    const measure = () => {
      const overflow = textEl.scrollWidth - container.clientWidth
      setShift(overflow > 0 ? overflow : 0)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    ro.observe(textEl)
    return () => ro.disconnect()
  }, [text])

  const shouldScroll = shift > 0
  const duration = Math.max(shift / 40, 4)

  return (
    <div ref={containerRef} className={cn("overflow-hidden whitespace-nowrap", className)}>
      <span
        ref={textRef}
        className={cn("inline-block", shouldScroll && "animate-marquee-scroll")}
        style={
          shouldScroll
            ? ({
                "--marquee-shift": `-${shift}px`,
                "--marquee-duration": `${duration}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {text}
      </span>
    </div>
  )
}

"use client"

import { DotLottie, DotLottieReact, DotLottieReactProps } from "@lottiefiles/dotlottie-react"
import { useEffect, useRef } from "react"

interface TriggeredDotLottieProps extends DotLottieReactProps {
  isActive: boolean
  delay?: number
}

export default function TriggeredDotLottie({ width, height, isActive, src, delay }: TriggeredDotLottieProps) {
  const lottieRef = useRef<DotLottie | null>(null)

  useEffect(() => {
    let timeoutKey: ReturnType<typeof setTimeout> | undefined

    if (!lottieRef.current) {
      return
    }

    if (!isActive) {
      lottieRef.current.stop()
      return
    }

    if (delay) {
      timeoutKey = setTimeout(() => {
        lottieRef.current?.play()
      }, delay)
    } else {
      lottieRef.current.play()
    }

    return () => {
      if (timeoutKey) {
        clearTimeout(timeoutKey)
      }
    }
  }, [isActive, delay])

  return (
    <div
      style={{
        width,
        height,
      }}
    >
      <DotLottieReact
        dotLottieRefCallback={(dotLottie) => {
          lottieRef.current = dotLottie
        }}
        src={src}
        loop={false}
        autoplay={false}
      />
    </div>
  )
}

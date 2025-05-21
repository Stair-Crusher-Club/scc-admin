"use client"

import { LottieComponentProps, LottieRefCurrentProps } from "lottie-react"
import dynamic from "next/dynamic"
import { useEffect, useRef } from "react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

interface TriggeredLottieProps extends LottieComponentProps {
  isActive: boolean
  delay?: number
}

export default function TriggeredLottie({ isActive, animationData, delay }: TriggeredLottieProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

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

  return <Lottie lottieRef={lottieRef} animationData={animationData} loop={false} autoPlay={false} />
}

import Lottie, { LottieRefCurrentProps } from "lottie-react"
import { useEffect, useRef } from "react"

interface TriggeredLottieProps {
  isActive: boolean
  source: object
  delay?: number
}

export default function TriggeredLottie({ isActive, source, delay }: TriggeredLottieProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    let timeoutKey: ReturnType<typeof setTimeout> | undefined

    if (isActive && lottieRef.current) {
      lottieRef.current.stop()

      if (delay) {
        timeoutKey = setTimeout(() => {
          lottieRef.current?.play()
        }, delay)
      } else {
        lottieRef.current.play()
      }
    }

    return () => {
      if (timeoutKey) {
        clearTimeout(timeoutKey)
      }
    }
  }, [isActive, delay])

  return <Lottie lottieRef={lottieRef} animationData={source} loop={false} autoPlay={false} />
}

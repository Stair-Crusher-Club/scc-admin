import Lottie, { LottieComponentProps, LottieRefCurrentProps } from "lottie-react"
import { useEffect, useRef } from "react"

interface TriggeredLottieProps extends LottieComponentProps {
  isActive: boolean
  delay?: number
}

export default function TriggeredLottie({ isActive, animationData, delay }: TriggeredLottieProps) {
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
      }
    }

    return () => {
      if (timeoutKey) {
        clearTimeout(timeoutKey)
      }
    }
  }, [isActive, delay])

  return <Lottie lottieRef={lottieRef} animationData={animationData} loop={false} autoPlay={false} />
}

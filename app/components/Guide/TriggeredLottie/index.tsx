import Lottie, { LottieRefCurrentProps } from "lottie-react"
import { useEffect, useRef } from "react"

export default function TriggeredLottie({ isActive, source }: { isActive: boolean; source: object }) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)

  useEffect(() => {
    if (isActive && lottieRef.current) {
      lottieRef.current.stop()
      lottieRef.current.play()
    }
  }, [isActive])

  return <Lottie lottieRef={lottieRef} animationData={source} loop={false} autoPlay={false} />
}

import { TouchEvent, useRef } from "react"

interface UseSwipeProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export const useSwipe = <T>({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseSwipeProps) => {
  const startXRef = useRef<number | null>(null)

  const onTouchStart = (e: TouchEvent<T>) => {
    startXRef.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: TouchEvent<T>) => {
    if (startXRef.current === null) return

    const endX = e.changedTouches[0].clientX
    const diffX = endX - startXRef.current

    if (diffX > threshold) {
      onSwipeRight?.()
    } else if (diffX < -threshold) {
      onSwipeLeft?.()
    }

    startXRef.current = null
  }

  return { onTouchStart, onTouchEnd }
}

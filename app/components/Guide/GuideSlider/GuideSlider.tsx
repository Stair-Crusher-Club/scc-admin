"use client"

import { useCallback, useEffect, useState } from "react"

import { GuideSlideContent } from "@/constants/guide"
import { useSwipe } from "@/hooks/useSwipe"

import GuideSliderItem from "./GuideSliderItem"

interface GuildSliderProps {
  name: string
  items: GuideSlideContent[]
  slideItemWidth?: number
  slideGap?: number
}

export default function GuideSlider({ name, items = [], slideGap = 12 }: GuildSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slideItemWidth, setSlideItemWidth] = useState(0)

  const onClickPrev = useCallback(() => {
    setCurrentIndex((idx) => Math.max(idx - 1, 0))
  }, [currentIndex])

  const onClickNext = useCallback(() => {
    setCurrentIndex((idx) => Math.min(idx + 1, items.length - 1))
  }, [currentIndex])

  const { onTouchStart, onTouchEnd } = useSwipe<HTMLDivElement>({
    onSwipeLeft: onClickNext,
    onSwipeRight: onClickPrev,
  })

  useEffect(() => {
    if (slideItemWidth === 0) {
      setSlideItemWidth(Math.min(window.innerWidth - 40, 600))
    }

    function handleResize() {
      setSlideItemWidth(Math.min(window.innerWidth - 40, 600))
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        style={{
          display: "flex",
          transition: "transform 0.5s ease",
          transform: `translateX(-${currentIndex * (slideItemWidth + slideGap)}px)`,
          gap: slideGap,
          width: slideItemWidth,
        }}
      >
        {items.map((item, idx) => (
          <div
            key={`${name}-slide-item-${idx}`}
            style={{
              flexShrink: 0,
              width: slideItemWidth,
              transition: "transform 0.3s, opacity 0.3s",
            }}
          >
            <GuideSliderItem
              name={name}
              index={idx}
              isActive={currentIndex === idx}
              stepNumber={idx + 1}
              slideCount={items.length}
              onClickPrev={onClickPrev}
              onClickNext={onClickNext}
              hiddenPrevButton={idx === 0}
              hiddenNextButton={idx === items.length - 1}
              {...item}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

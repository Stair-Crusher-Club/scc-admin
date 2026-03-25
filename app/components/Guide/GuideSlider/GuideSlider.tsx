"use client"

import { useCallback, useEffect, useState } from "react"

import { GuideSlideContent } from "@/constants/guide"
import { useSwipe } from "@/hooks/useSwipe"

import GuideSliderItem from "./GuideSliderItem"

interface GuildSliderProps {
  name: string
  items: GuideSlideContent[]
}

export default function GuideSlider({ name, items = [] }: GuildSliderProps) {
  const slideGap = 12
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slideItemWidth, setSlideItemWidth] = useState(320)

  const onClickPrev = useCallback(() => {
    setCurrentIndex((idx) => Math.max(idx - 1, 0))
  }, [])

  const onClickNext = useCallback(() => {
    setCurrentIndex((idx) => Math.min(idx + 1, items.length - 1))
  }, [items.length])

  const { onTouchStart, onTouchEnd } = useSwipe<HTMLDivElement>({
    onSwipeLeft: onClickNext,
    onSwipeRight: onClickPrev,
  })

  useEffect(() => {
    setSlideItemWidth(Math.min(window.innerWidth - 40, 400))

    function handleResize() {
      setSlideItemWidth(Math.min(window.innerWidth - 40, 400))
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
              width={slideItemWidth}
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

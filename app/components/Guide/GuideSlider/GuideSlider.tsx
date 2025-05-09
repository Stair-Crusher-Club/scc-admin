"use client"

import { useCallback, useState } from "react"

import { GuideSlideContent } from "@/constants/guide"

import GuideSliderItem from "./GuideSliderItem"

interface GuildSliderProps {
  name: string
  items: GuideSlideContent[]
  slideItemWidth?: number
  slideGap?: number
}

export default function GuideSlider({ name, items = [], slideItemWidth = 335, slideGap = 12 }: GuildSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const onClickPrev = useCallback(() => {
    if (currentIndex <= 0) {
      return
    }
    setCurrentIndex((idx) => idx - 1)
  }, [currentIndex])

  const onClickNext = useCallback(() => {
    if (currentIndex >= items.length - 1) {
      return
    }
    setCurrentIndex((idx) => idx + 1)
  }, [currentIndex])

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
      }}
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

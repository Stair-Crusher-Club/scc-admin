import Image from "next/image"

import { GuideSlideContent } from "@/constants/guide"

import TriggeredDotLottie from "../TriggeredDotLottie"
import * as S from "./GuideSliderItem.style"

export type GuideSlideItemProps = GuideSlideContent & {
  name?: string
  index: number
  width?: number
  slideCount: number
  onClickPrev: () => void
  onClickNext: () => void
  stepNumber: number
  hiddenPrevButton?: boolean
  hiddenNextButton?: boolean
  isActive: boolean
}

export default function GuideSliderItem({
  name = "guide-slide-item",
  index,
  width = 335,
  slideCount = 3,
  onClickPrev,
  onClickNext,
  stepNumber,
  source,
  sourceType,
  imageObjectFit,
  title,
  description,
  extraDescription,
  hiddenPrevButton = false,
  hiddenNextButton = false,
  isActive = false,
}: GuideSlideItemProps) {
  return (
    <div>
      <S.Container>
        {/* Image */}
        <S.ImageSection>
          {!hiddenPrevButton && (
            <S.ArrowButton onClick={onClickPrev} disabled={!isActive} position="prev">
              <Image src="/arrow-prev.png" alt="이전 버튼" width={24} height={24} />
            </S.ArrowButton>
          )}

          {sourceType === "image" ? (
            <div style={{ width, height: 220, position: "relative" }}>
              <Image
                src={source}
                alt="이미지"
                style={{ width: "100%", height: "100%", objectFit: imageObjectFit ?? "contain" }}
                fill
                unoptimized
              />
            </div>
          ) : (
            <TriggeredDotLottie width={width} height={220} src={source} isActive={isActive} delay={800} />
          )}

          {!hiddenNextButton && (
            <S.ArrowButton onClick={onClickNext} disabled={!isActive} position="next">
              <Image src="/arrow-next.png" alt="다음 버튼" width={24} height={24} />
            </S.ArrowButton>
          )}
        </S.ImageSection>

        {/* Detail */}
        <S.DetailSection>
          {/* Dots */}
          <S.Dots>
            {Array(slideCount)
              .fill(0)
              .map((_, idx) => (
                <S.Dot key={`${name}-dot-${idx}`} isCurrent={index === idx} />
              ))}
          </S.Dots>

          {/* Description */}
          <S.DescriptionItem>
            <S.Title>{title ? title : `${stepNumber}단계`}</S.Title>
            {description.map((desc, idx) => (
              <S.Description key={`${name}-desc-${idx}`} dangerouslySetInnerHTML={{ __html: desc }} />
            ))}
          </S.DescriptionItem>
        </S.DetailSection>
      </S.Container>
      {extraDescription && (
        <S.ExtraDescriptionSection>
          <S.ExtraDescriptionTitle>{extraDescription.title}</S.ExtraDescriptionTitle>
          <ul>
            {extraDescription.description.map((desc, idx) => (
              <S.ExtraDescriptionItem
                key={`${name}-extra-desc-${idx}`}
                hasStyle={extraDescription.descriptionStyle && extraDescription.descriptionStyle !== "none"}
              >
                {extraDescription.descriptionStyle === "disc" && <S.ExtraDescriptionDot />}
                <S.ExtraDescription dangerouslySetInnerHTML={{ __html: desc }} />
              </S.ExtraDescriptionItem>
            ))}
          </ul>
        </S.ExtraDescriptionSection>
      )}
    </div>
  )
}

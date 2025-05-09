import Image from "next/image"

import { GuideSlideContent } from "@/constants/guide"

import TriggeredLottie from "../TriggeredLottie"
import * as S from "./GuideSliderItem.style"

export type GuideSlideItemProps = GuideSlideContent & {
  name?: string
  index: number
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
  slideCount = 3,
  onClickPrev,
  onClickNext,
  stepNumber,
  source,
  sourceType,
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
          <div>
            {sourceType === "image" ? (
              <Image src={source} alt="이미지" width={335} height={217} />
            ) : (
              <TriggeredLottie source={source} isActive={isActive} />
            )}
          </div>
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
              <S.Description key={`${name}-desc-${idx}`}>{desc}</S.Description>
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
                hasStyle={extraDescription.descriptionStyle !== "none"}
              >
                {extraDescription.descriptionStyle === "disc" && <S.ExtraDescriptionDot />}
                <S.ExtraDescription>{desc}</S.ExtraDescription>
              </S.ExtraDescriptionItem>
            ))}
          </ul>
        </S.ExtraDescriptionSection>
      )}
    </div>
  )
}

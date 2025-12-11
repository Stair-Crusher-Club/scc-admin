import { BasicModalProps } from "@reactleaf/modal"

import { useModal } from "@/hooks/useModal"

import * as S from "./AccessibilityImage.style"

interface Props extends BasicModalProps {
  imageUrl: string
}

export default function BuildingDetailSheet({ imageUrl }: Props) {
  const { closeAll } = useModal()

  return (
    <S.Container onClick={closeAll}>
      <S.AccessibilityImage
        src={imageUrl}
        onClick={(e) => e.stopPropagation()}
        alt="접근성 이미지"
      />
    </S.Container>
  )
}

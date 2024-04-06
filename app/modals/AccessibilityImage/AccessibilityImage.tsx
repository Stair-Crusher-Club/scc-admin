import { BasicModalProps } from "@reactleaf/modal"

import * as S from "./AccessibilityImage.style"

interface Props extends BasicModalProps {
  imageUrl: string
}

export default function BuildingDetailSheet({ imageUrl }: Props) {
  return (
    <S.AccessibilityImage src={imageUrl} />
  )
}

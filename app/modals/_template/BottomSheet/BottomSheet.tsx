import { BasicModalProps } from "@reactleaf/modal"

import Close from "@/icons/Close"

import * as S from "./BottomSheet.style"

export interface BottomSheetProps extends BasicModalProps {
  children: React.ReactNode
  title?: string
  style?: React.CSSProperties
  actionButton?: React.ReactNode
}
export default function BottomSheet({ title, actionButton, style, children, visible, close }: BottomSheetProps) {
  return (
    <S.BottomSheet visible={visible} onClick={(e) => e.stopPropagation()} style={style}>
      {title && (
        <S.BottomSheetHeader>
          <S.CloseButton onClick={close}>
            <Close size={28} color="black" />
          </S.CloseButton>
          <S.SheetTitle>{title}</S.SheetTitle>
          <S.ActionButtonWrapper>{actionButton}</S.ActionButtonWrapper>
        </S.BottomSheetHeader>
      )}
      <S.BottomSheetBody>{children}</S.BottomSheetBody>
    </S.BottomSheet>
  )
}

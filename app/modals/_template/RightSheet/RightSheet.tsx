import { BasicModalProps } from "@reactleaf/modal"

import Close from "@/icons/Close"

import * as S from "./RightSheet.style"

export interface RightSheetProps extends BasicModalProps {
  children: React.ReactNode
  title?: React.ReactNode
  style?: React.CSSProperties
  actionButton?: React.ReactNode
}
export default function RightSheet({ title, actionButton, style, children, visible, close }: RightSheetProps) {
  return (
    <S.RightSheet visible={visible} onClick={(e) => e.stopPropagation()} style={style}>
      {title && (
        <S.RightSheetHeader>
          <S.CloseButton onClick={close}>
            <Close size={28} color="black" />
          </S.CloseButton>
          {typeof title == "string" ? <S.SheetTitle>{title}</S.SheetTitle> : title}
          <S.ActionButtonWrapper>{actionButton}</S.ActionButtonWrapper>
        </S.RightSheetHeader>
      )}
      <S.RightSheetBody>{children}</S.RightSheetBody>
    </S.RightSheet>
  )
}

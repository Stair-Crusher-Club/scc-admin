"use client"

// TODO 모달 라이브러리 개선 후 제거
import { useEffect } from "react"

import QuestCompletion, { QuestCompletionProps } from "./QuestCompletion"
import * as S from "./QuestCompletion.style"

interface Props extends QuestCompletionProps {
  open: boolean
}

export default function Modal({ open, close, questName, questClearDate }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <S.QuestCompletionWrapper onClick={close}>
      <QuestCompletion close={close} questName={questName} questClearDate={questClearDate} />
    </S.QuestCompletionWrapper>
  )
}

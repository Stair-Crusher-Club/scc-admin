"use client"

import { format } from "date-fns"
import { useState } from "react"

import QuestCompletionModal from "@/modals/QuestCompletion"

export default function TestPage() {
  const [openQuestionCompletionModal, setOpenQuestionCompletionModal] = useState(true)
  return (
    <>
      <QuestCompletionModal
        open={openQuestionCompletionModal}
        close={() => setOpenQuestionCompletionModal(false)}
        questName={"[5/17] 동대문역 계단정복대 (플러스) - B조"}
        questClearDate={format(new Date(), "yyyy.MM.dd")}
      />
      <button onClick={() => setOpenQuestionCompletionModal(true)}>모달 열기</button>
    </>
  )
}

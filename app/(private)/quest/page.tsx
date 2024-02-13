"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { useQuests } from "@/lib/apis/api"
import { QuestSummary } from "@/lib/models/quest"

import * as S from "./page.style"

export default function QuestList() {
  const router = useRouter()
  const { data } = useQuests()
  const quests = data ?? []

  const regrouped = quests.reduce(
    (acc, q) => {
      const key = q.name.split(" - ")[0]
      if (!acc[key]) acc[key] = []
      acc[key].push(q)
      return acc
    },
    {} as Record<string, QuestSummary[]>,
  )

  function share(quests: QuestSummary[]) {
    const text = quests.map((q) => `${q.name} : ${window.location.origin}/public/quest/${q.id}`).join("\n")
    navigator.clipboard.writeText(text)
    toast.success("공개 URL 목록이 클립보드에 복사되었습니다.")
  }

  return (
    <S.Page>
      <S.PageTitle>
        퀘스트 관리<S.PageAction onClick={() => router.push("/quest/create")}>퀘스트 추가</S.PageAction>
      </S.PageTitle>

      {Object.entries(regrouped).map(([key, quests]) => (
        <S.Event key={key}>
          <S.EventName>
            {key} <S.ShareButton onClick={() => share(quests)}>공유하기</S.ShareButton>
          </S.EventName>
          <S.Quests>
            {quests
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map((q) => (
                <Link key={q.id} href={`/quest/${q.id}`}>
                  <S.Quest>{q.name.split(" - ")[1]}</S.Quest>
                </Link>
              ))}
          </S.Quests>
        </S.Event>
      ))}
    </S.Page>
  )
}

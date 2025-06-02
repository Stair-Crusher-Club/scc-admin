"use client"

import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { deleteQuest } from "@/lib/apis/api"
import { ClubQuestSummaryDTO } from "@/lib/generated-sources/openapi"

import { useClubQuestSummaries } from "@/(private)/quest/query"
import { Contents, Header } from "@/components/layout"

import * as S from "./page.style"

export default function QuestList() {
  const router = useRouter()
  const { data, fetchNextPage, hasNextPage } = useClubQuestSummaries()
  const queryClient = useQueryClient()
  const quests = data?.pages.flatMap((p) => p.list) ?? []

  const regrouped = quests.reduce(
    (acc, q) => {
      const key = q.name.split(" - ")[0]
      if (!acc[key]) acc[key] = []
      acc[key].push(q)
      return acc
    },
    {} as Record<string, ClubQuestSummaryDTO[]>,
  )

  function share(quests: ClubQuestSummaryDTO[]) {
    const [groupName] = quests[0].name.split(" - ")
    const questList = quests.map((q) => {
      const url = q.shortenedUrl || `${window.location.origin}/public/quest/${q.id}`
      return `- ${q.name.split(" - ")[1]}: ${url}`
    })

    navigator.clipboard.writeText(`${groupName}\n${questList.join("\n")}`)
    toast.success("공개 URL 목록이 클립보드에 복사되었습니다.")
  }

  async function deleteQuests(quests: ClubQuestSummaryDTO[]) {
    const confirm = window.confirm("정말로 삭제하시겠습니까?")
    if (!confirm) return

    for (const q of quests) {
      await deleteQuest({ questId: q.id })
    }
    queryClient.invalidateQueries({ queryKey: ["@clubQuestSummaries"] })
    toast.success(`퀘스트가 삭제되었습니다.`)
  }

  return (
    <>
      <Header title="퀘스트 관리">
        <Header.ActionButton onClick={() => router.push("/quest/create")}>퀘스트 추가</Header.ActionButton>
      </Header>
      <Contents.Normal>
        {Object.entries(regrouped).map(([questGroupName, quests]) => (
          <S.QuestRow key={questGroupName}>
            <S.QuestHeader>
              {questGroupName}
              <S.CreatedAt></S.CreatedAt>
              <S.ShareButton onClick={() => share(quests)}>공유하기</S.ShareButton>
              <S.DeleteButton onClick={() => deleteQuests(quests)}>삭제하기</S.DeleteButton>
            </S.QuestHeader>
            <S.Quests>
              {quests
                .sort((a, b) => (a.name > b.name ? 1 : -1))
                .map((q) => (
                  <Link key={q.id} href={`/quest/${q.id}`}>
                    <S.Quest>{q.name.split(" - ")[1]}</S.Quest>
                  </Link>
                ))}
            </S.Quests>
          </S.QuestRow>
        ))}
        {hasNextPage && <S.LoadNextPageButton onClick={() => fetchNextPage()}>더 불러오기</S.LoadNextPageButton>}
      </Contents.Normal>
    </>
  )
}

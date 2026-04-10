"use client"

import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-toastify"

import { deleteQuest, renameQuestGroup } from "@/lib/apis/api"
import { ClubQuestSummaryDTO } from "@/lib/generated-sources/openapi"

import { useClubQuestSummaries } from "@/(private)/quest/query"
import { Contents } from "@/components/layout"
import { PageActions } from "@/components/page-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import * as S from "./page.style"
import { getQuestGroupName } from "./util"

export default function QuestList() {
  const router = useRouter()
  const { data, fetchNextPage, hasNextPage } = useClubQuestSummaries()
  const queryClient = useQueryClient()
  const quests = data?.pages.flatMap((p) => p.list) ?? []

  const [renameTarget, setRenameTarget] = useState<{ groupId: string; currentName: string } | null>(null)
  const [newName, setNewName] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)

  const regrouped = quests.reduce(
    (acc, q) => {
      const key = getQuestGroupName(q.name)!;
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

  function openRenameDialog(groupId: string, currentName: string) {
    setRenameTarget({ groupId, currentName })
    setNewName(currentName)
  }

  async function handleRename() {
    if (!renameTarget || !newName.trim()) return
    setIsRenaming(true)
    try {
      await renameQuestGroup({ groupId: renameTarget.groupId, questNamePrefix: newName.trim() })
      queryClient.invalidateQueries({ queryKey: ["@clubQuestSummaries"] })
      toast.success("퀘스트 이름이 변경되었습니다.")
      setRenameTarget(null)
    } catch {
      toast.error("퀘스트 이름 변경에 실패했습니다.")
    } finally {
      setIsRenaming(false)
    }
  }

  return (
    <Contents.Normal>
      <PageActions>
        <Button onClick={() => router.push("/quest/create")} size="sm">퀘스트 생성</Button>
      </PageActions>
      {Object.entries(regrouped).map(([questGroupName, quests]) => (
          <S.QuestRow key={questGroupName}>
            <S.QuestHeader>
              {questGroupName}
              <S.CreatedAt></S.CreatedAt>
              {quests[0].groupId
                ? (
                  <>
                    <S.ManageGroupButton onClick={() => router.push(`/quest/group/${encodeURIComponent(quests[0].groupId!)}`)}>
                      그룹 관리
                    </S.ManageGroupButton>
                    <S.RenameButton onClick={() => openRenameDialog(quests[0].groupId!, questGroupName)}>
                      이름 변경
                    </S.RenameButton>
                  </>
                )
                : null
              }
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

      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>퀘스트 이름 변경</DialogTitle>
          </DialogHeader>
          <input
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleRename()}
            placeholder="새 퀘스트 이름"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>취소</Button>
            <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>
              {isRenaming ? "변경 중..." : "변경"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Contents.Normal>
  )
}

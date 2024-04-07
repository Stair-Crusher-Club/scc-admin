"use client"

import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

import { deleteChallenge, useChallenge } from "@/lib/apis/api"

import { Contents, Header } from "@/components/layout"

import ChallengeForm, { ChallengeFormValues, actionOptions, defaultValues } from "../components/ChallengeForm"
import * as S from "./page.style"

export default function ChallengeDetail() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: challenge } = useChallenge({ id })
  const queryClient = useQueryClient()
  const form = useForm<ChallengeFormValues>({ defaultValues })

  useEffect(() => {
    if (!challenge) return
    form.reset({
      name: challenge.name,
      inviteCode: challenge.invitationCode || "",
      joinCode: challenge.passcode || "",
      startDate: format(challenge.startsAtMillis, "yyyy-MM-dd HH:mm"),
      endDate: challenge.endsAtMillis ? format(challenge.endsAtMillis, "yyyy-MM-dd HH:mm") : "",
      milestones: challenge.milestones.map((v) => ({ label: v.toString(), value: v.toString() })),
      questActions: actionOptions.filter((v) => challenge.conditions[0].actionCondition.types.includes(v.value)),
      description: challenge.description,
    })
  }, [challenge])

  async function confirmAndDeleteChallenge() {
    if (!confirm("정말 삭제하시겠습니까?")) return
    await deleteChallenge({ id })
    queryClient.invalidateQueries({ queryKey: ["@challenges"], exact: true })
    router.back()
  }

  return (
    <>
      <Header title="챌린지 상세" />
      <Contents.Normal>
        <ChallengeForm form={form} disabled />
        <S.DeleteButton onClick={confirmAndDeleteChallenge}>삭제</S.DeleteButton>
      </Contents.Normal>
    </>
  )
}

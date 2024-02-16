"use client"

import { format } from "date-fns"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { useChallenge } from "@/lib/apis/api"
import { createChallenge } from "@/lib/apis/api"

import ChallengeForm, { ChallengeFormValues, actionOptions, defaultValues } from "../components/ChallengeForm"
import * as S from "./page.style"

export default function ChallengeDetail() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: challenge } = useChallenge({ id })
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

  async function onSubmit(values: ChallengeFormValues) {
    const { name, inviteCode, joinCode, startDate, endDate, milestones, questActions, questRegions, description } =
      values
    const milestoneNumbers = milestones.map((v) => parseInt(v.value))

    const res = await createChallenge({
      name: name,
      isPublic: inviteCode === "",
      invitationCode: inviteCode ? inviteCode : undefined,
      passcode: joinCode ? joinCode : undefined,
      startsAtMillis: new Date(startDate).getTime(),
      endsAtMillis: endDate ? new Date(endDate).getTime() : undefined,
      goal: milestoneNumbers.at(-1) ?? 0,
      milestones: milestoneNumbers.slice(0, -1),
      conditions: [
        {
          addressCondition: { rawEupMyeonDongs: questRegions?.map((v) => v.label.split(" ").at(-1) ?? "") || [] },
          actionCondition: { types: questActions.map((v) => v.value) },
        },
      ],
      description: description,
    })

    if (res.status !== 200) {
      toast.error("챌린지 생성에 실패했습니다.")
      return
    }
    toast.success("챌린지가 생성되었습니다.")
    // router.push("/challenge")
  }

  return (
    <S.Page>
      <S.Header>퀘스트 상세</S.Header>
      <S.Body>
        <ChallengeForm forEdit form={form} onSubmit={onSubmit} />
        <S.SubmitButton disabled={!form.formState.isDirty}>수정</S.SubmitButton>
      </S.Body>
    </S.Page>
  )
}

"use client"

import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { createChallenge } from "@/lib/apis/api"

import ChallengeForm, { ChallengeFormValues, defaultValues } from "../components/ChallengeForm"
import * as S from "./page.style"

export default function CreateChallenge() {
  const router = useRouter()

  const form = useForm<ChallengeFormValues>({ defaultValues })

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
    router.push("/challenge")
  }

  return (
    <S.Page>
      <S.Header>퀘스트 생성</S.Header>
      <S.Body>
        <ChallengeForm form={form} onSubmit={onSubmit} />
        <S.SubmitButton>등록</S.SubmitButton>
      </S.Body>
    </S.Page>
  )
}

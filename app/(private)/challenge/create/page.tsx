"use client"

import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { createChallenge } from "@/lib/apis/api"

import { Contents, Header } from "@/components/layout"

import ChallengeForm, { ChallengeFormValues, defaultValues } from "../components/ChallengeForm"
import * as S from "./page.style"

export default function CreateChallenge() {
  const router = useRouter()

  const form = useForm<ChallengeFormValues>({ defaultValues })

  async function onSubmit(values: ChallengeFormValues) {
    const {
      name,
      inviteCode,
      joinCode,
      startDate,
      endDate,
      milestones,
      questActions,
      questRegions,
      description,
      crusherGroupName,
      imageUrl,
      imageWidth,
      imageHeight,
    } = values

    const milestoneNumbers = milestones.map((v) => parseInt(v.value))
    let icon
    if (imageUrl && imageUrl.trim() !== "") {
      icon = {
        url: imageUrl,
        width: imageWidth!!,
        height: imageHeight!!,
      }
    } else {
      icon = undefined
    }

    let crusherGroup
    if (crusherGroupName == null || crusherGroupName === "") {
      crusherGroup = undefined
    } else {
      crusherGroup = {
        name: crusherGroupName,
        icon: icon,
      }
    }

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
      crusherGroup: crusherGroup,
    })

    if (res.status !== 200) {
      toast.error("챌린지 생성에 실패했습니다.")
      return
    }
    toast.success("챌린지가 생성되었습니다.")
    router.push("/challenge")
  }

  return (
    <>
      <Header title="챌린지 생성" />
      <Contents.Normal>
        <ChallengeForm id="create-challenge" form={form} onSubmit={onSubmit} />
        <S.SubmitButton type="submit" form="create-challenge">
          등록
        </S.SubmitButton>
      </Contents.Normal>
    </>
  )
}

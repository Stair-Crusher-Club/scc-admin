"use client"

import { useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

import { deleteChallenge, updateChallenge, useChallenge } from "@/lib/apis/api"
import { AdminUpdateChallengeRequestDTO } from "@/lib/generated-sources/openapi"

import { Contents, Header } from "@/components/layout"

import ChallengeForm, { ChallengeFormValues, actionOptions, defaultValues } from "../components/ChallengeForm"
import * as S from "./page.style"

export default function ChallengeDetail() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: challenge } = useChallenge({ id })
  const queryClient = useQueryClient()
  const form = useForm<ChallengeFormValues>({ defaultValues })
  const [editMode, setEditMode] = useState(false)
  const originalChallenge = challenge

  useEffect(() => {
    if (!challenge) return
    form.reset({
      name: challenge.name,
      inviteCode: challenge.invitationCode || "",
      joinCode: challenge.passcode || "",
      startDate: new Date(challenge.startsAtMillis),
      endDate: challenge.endsAtMillis ? new Date(challenge.endsAtMillis) : null,
      milestones: [
        ...challenge.milestones.map((v) => ({ label: v.toString(), value: v.toString() })),
        {label: challenge.goal.toString(), value: challenge.goal.toString()}
      ],
      questActions: actionOptions.filter((v) => challenge.conditions[0]?.actionCondition?.types?.includes(v.value)),
      description: challenge.description,
      isB2B: challenge.isB2B ?? false,
      b2bFormSchema: challenge.b2bFormSchema,
      crusherGroupName: challenge.crusherGroup?.name || "",
      imageUrl: challenge.crusherGroup?.icon?.url || "",
      imageWidth: challenge.crusherGroup?.icon?.width,
      imageHeight: challenge.crusherGroup?.icon?.height,
    })
  }, [challenge])

  async function confirmAndDeleteChallenge() {
    if (!confirm("정말 삭제하시겠습니까?")) return
    await deleteChallenge({ id })
    queryClient.invalidateQueries({ queryKey: ["@challenges"], exact: true })
    router.back()
  }

  async function confirmAndUpdateChallenge(values: ChallengeFormValues) {
    if (!confirm("정말 수정하시겠습니까?")) return
    let icon
    if (values.imageUrl && values.imageUrl.trim() !== "") {
      icon = {
        url: values.imageUrl,
        width: values.imageWidth!!,
        height: values.imageHeight!!,
      }
    } else {
      icon = undefined
    }

    let crusherGroup
    if (values.crusherGroupName == null || values.crusherGroupName === "") {
      crusherGroup = undefined
    } else {
      crusherGroup = {
        name: values.crusherGroupName,
        icon: icon,
      }
    }

    const milestoneNumbers = values.milestones.map((v) => parseInt(v.value))
    
    const payload: AdminUpdateChallengeRequestDTO = {
      name: values.name,
      invitationCode: values.inviteCode || undefined,
      passcode: values.joinCode || undefined,
      startsAtMillis: values.startDate.getTime(),
      endsAtMillis: values.endDate ? values.endDate.getTime() : undefined,
      goal: milestoneNumbers.at(-1) ?? 0,
      milestones: milestoneNumbers.slice(0, -1),
      conditions: [
        {
          addressCondition: { rawEupMyeonDongs: values.questRegions?.map((v) => v.label.split(" ").at(-1) ?? "") || [] },
          actionCondition: { types: values.questActions.map((v) => v.value) as any },
        },
      ],
      description: values.description,
      isB2B: values.isB2B,
      b2bFormSchema: values.isB2B ? values.b2bFormSchema : undefined,
      crusherGroup: crusherGroup,
    }
    const res = await updateChallenge({ id, payload })
    if (res.status !== 200) {
      alert("챌린지 수정에 실패했습니다.")
      return
    }
    alert("챌린지가 수정되었습니다.")
    // 챌린지 상세 데이터 다시 불러오기
    await queryClient.invalidateQueries({ queryKey: ["@challenge", id] })
    // 챌린지 목록 데이터도 다시 불러오기
    await queryClient.invalidateQueries({ queryKey: ["@challenges"] })
    setEditMode(false)
  }

  function handleFormSubmit(values: ChallengeFormValues) {
    if (!editMode) return
    confirmAndUpdateChallenge(values)
  }

  return (
    <>
      <Header title="챌린지 상세" />
      <Contents.Normal>
        <ChallengeForm id="edit-challenge" form={form} onSubmit={handleFormSubmit} isEditMode={editMode} />
        {editMode ? (
          <S.ButtonGroup>
            <S.SubmitButton type="submit" form="edit-challenge">
              수정 완료
            </S.SubmitButton>
            <S.CancelButton
              type="button"
              onClick={() => {
                setEditMode(false)
                if (originalChallenge) {
                  form.reset({
                    name: originalChallenge.name,
                    inviteCode: originalChallenge.invitationCode || "",
                    joinCode: originalChallenge.passcode || "",
                    startDate: new Date(originalChallenge.startsAtMillis),
                    endDate: originalChallenge.endsAtMillis ? new Date(originalChallenge.endsAtMillis) : null,
                    milestones: [
                      ...originalChallenge.milestones.map((v) => ({ label: v.toString(), value: v.toString() })),
                      {label: originalChallenge.goal.toString(), value: originalChallenge.goal.toString()}
                    ],
                    questActions: actionOptions.filter(
                      (v) => originalChallenge.conditions?.[0]?.actionCondition?.types?.includes(v.value) ?? false,
                    ),
                    description: originalChallenge.description,
                    isB2B: originalChallenge.isB2B ?? false,
                    b2bFormSchema: originalChallenge.b2bFormSchema,
                    crusherGroupName: originalChallenge.crusherGroup?.name || "",
                    imageUrl: originalChallenge.crusherGroup?.icon?.url,
                    imageWidth: originalChallenge.crusherGroup?.icon?.width,
                    imageHeight: originalChallenge.crusherGroup?.icon?.height,
                  })
                }
              }}
            >
              취소
            </S.CancelButton>
          </S.ButtonGroup>
        ) : (
          <S.ButtonGroup>
            <S.EditButton onClick={() => setEditMode(true)}>수정하기</S.EditButton>
          </S.ButtonGroup>
        )}
        <S.DeleteButton onClick={confirmAndDeleteChallenge}>삭제</S.DeleteButton>
      </Contents.Normal>
    </>
  )
}

"use client"

import { TextInput } from "@reactleaf/input/hookform"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { createChallenge } from "@/lib/apis/api"

import Autocomplete from "@/components/Autocomplete"
import DateInput from "@/components/DateInput"
import MultiSelect from "@/components/MultiSelect"
import { Flex } from "@/styles/jsx"

import * as S from "./page.style"
import { emdOptions } from "./regionOptions"

interface Option {
  label: string
  value: string
}

interface FormValues {
  name: string
  inviteCode: string
  joinCode: string
  startDate: string
  endDate: string
  milestones: Option[]
  questActions: Option[]
  questRegions: Option[]
  description: string
}

const actionOptions = [
  { label: "건물 정보 등록", value: "BUILDING_ACCESSIBILITY" },
  { label: "건물 코멘트 등록", value: "BUILDING_ACCESSIBILITY_COMMENT" },
  { label: "장소 정보 등록", value: "PLACE_ACCESSIBILITY" },
  { label: "장소 코멘트 등록", value: "PLACE_ACCESSIBILITY_COMMENT" },
]

export default function CreateChallenge() {
  const router = useRouter()
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      inviteCode: "",
      joinCode: "",
      startDate: format(new Date(), "yyyy-MM-dd HH:mm"),
      questActions: actionOptions,
      description: "",
    },
  })

  async function onSubmit(values: FormValues) {
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

  // milestones는 증가하는 순서로 입력되도록 한다.
  // useEffect 실행을 최소화하기 위한 stringify
  const stringifiedMilestones = form
    .watch("milestones")
    ?.map((o) => o.value)
    .toString()

  useEffect(() => {
    const milestones = form.getValues("milestones")
    form.setValue("milestones", milestones?.sort((a, b) => parseInt(a.value) - parseInt(b.value)))
  }, [stringifiedMilestones])

  return (
    <S.Page>
      <S.Header>퀘스트 생성</S.Header>
      <S.Body>
        <S.Form width="50rem" onSubmit={form.handleSubmit(onSubmit)}>
          <FormProvider {...form}>
            <TextInput
              name="name"
              label="이름"
              rules={{ required: { value: true, message: "챌린지 이름을 입력해주세요" } }}
            />
            <Flex gap="2rem">
              <TextInput name="inviteCode" label="초대코드" placeholder="초대코드를 입력하면 비공개 챌린지가 됩니다." />
              <TextInput name="joinCode" label="참여코드" placeholder="챌린지에 참여할 때 입력해야 하는 암호입니다." />
            </Flex>
            <Flex gap="2rem">
              <DateInput name="startDate" label="챌린지 시작" />
              <DateInput name="endDate" label="챌린지 종료" placeholder="비워두면 무기한으로 적용됩니다." />
            </Flex>
            <Autocomplete
              name="milestones"
              label="마일스톤"
              placeholder="가장 큰 숫자가 목표로 지정됩니다."
              rules={{ required: { value: true, message: "마일스톤을 1개 이상 입력해주세요." } }}
              options={[
                { label: 100, value: 100 },
                { label: 500, value: 500 },
                { label: 1000, value: 1000 },
              ]}
            />
            <MultiSelect
              name="questRegions"
              label="퀘스트 대상 지역"
              placeholder="전체 지역"
              filterOption={(option, inputValue) => option.label.includes(inputValue)}
              options={emdOptions}
            />
            <MultiSelect
              name="questActions"
              label="퀘스트 대상 액션"
              placeholder="이 행동을 하면 퀘스트로 인정됩니다."
              closeMenuOnSelect={false}
              rules={{ required: { value: true, message: "1개 이상의 조건을 선택해주세요." } }}
              options={[
                { label: "건물 정보 등록", value: "BUILDING_ACCESSIBILITY" },
                { label: "건물 코멘트 등록", value: "BUILDING_ACCESSIBILITY_COMMENT" },
                { label: "장소 정보 등록", value: "PLACE_ACCESSIBILITY" },
                { label: "장소 코멘트 등록", value: "PLACE_ACCESSIBILITY_COMMENT" },
              ]}
            />
            <TextInput name="description" label="설명" />
          </FormProvider>

          <S.SubmitButton>등록</S.SubmitButton>
        </S.Form>
      </S.Body>
    </S.Page>
  )
}

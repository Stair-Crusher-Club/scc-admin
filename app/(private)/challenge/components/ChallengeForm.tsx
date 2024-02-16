"use client"

import { Autocomplete, Combobox, DateInput, TextInput } from "@reactleaf/input/hookform"
import { format } from "date-fns"
import { useEffect } from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { css } from "@/styles/css"
import { Flex } from "@/styles/jsx"

import { emdOptions } from "../create/regionOptions"

interface Option {
  label: string
  value: string
}

export const actionOptions = [
  { label: "건물 정보 등록", value: "BUILDING_ACCESSIBILITY" } as const,
  { label: "건물 코멘트 등록", value: "BUILDING_ACCESSIBILITY_COMMENT" } as const,
  { label: "장소 정보 등록", value: "PLACE_ACCESSIBILITY" } as const,
  { label: "장소 코멘트 등록", value: "PLACE_ACCESSIBILITY_COMMENT" } as const,
]

export interface ChallengeFormValues {
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

export const defaultValues: Partial<ChallengeFormValues> = {
  name: "",
  inviteCode: "",
  joinCode: "",
  startDate: format(new Date(), "yyyy-MM-dd HH:mm"),
  questActions: actionOptions,
  description: "",
}

interface Props {
  form: UseFormReturn<ChallengeFormValues>
  onSubmit: (values: ChallengeFormValues) => void
  forEdit?: boolean
}
export default function ChallengeForm({ forEdit, form, onSubmit }: Props) {
  // milestones는 증가하는 순서로 입력되도록 한다.
  // useEffect 실행을 최소화하기 위한 stringify
  const stringifiedMilestones = form
    .watch("milestones")
    ?.map((o) => o.value)
    .toString()

  useEffect(() => {
    const milestones = form.getValues("milestones")
    const sortedValues = milestones?.sort((a, b) => parseInt(a.value) - parseInt(b.value))
    if (stringifiedMilestones === sortedValues?.map((o) => o.value).toString()) return
    form.setValue("milestones", milestones?.sort((a, b) => parseInt(a.value) - parseInt(b.value)))
  }, [stringifiedMilestones])

  return (
    <FormProvider {...form}>
      <form className={css({ width: "50rem" })} onSubmit={form.handleSubmit(onSubmit)}>
        <TextInput
          name="name"
          label="이름"
          rules={{ required: { value: true, message: "챌린지 이름을 입력해주세요" } }}
          disabled={forEdit}
        />
        <Flex gap="2rem">
          <TextInput
            name="inviteCode"
            label="초대코드"
            placeholder="초대코드를 입력하면 비공개 챌린지가 됩니다."
            disabled={forEdit}
          />
          <TextInput
            name="joinCode"
            label="참여코드"
            placeholder="챌린지에 참여할 때 입력해야 하는 암호입니다."
            disabled={forEdit}
          />
        </Flex>
        <Flex gap="2rem">
          <DateInput name="startDate" label="챌린지 시작" dateFormat="yyyy-MM-dd HH:mm" />
          <DateInput
            name="endDate"
            label="챌린지 종료"
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="비워두면 무기한으로 적용됩니다."
          />
        </Flex>
        <Autocomplete
          name="milestones"
          label="마일스톤"
          placeholder="가장 큰 숫자가 목표로 지정됩니다."
          isDisabled={forEdit}
          rules={{ required: { value: true, message: "마일스톤을 1개 이상 입력해주세요." } }}
          options={[
            { label: "100", value: "100" },
            { label: "500", value: "500" },
            { label: "1000", value: "1000" },
          ]}
        />
        <Combobox
          isMulti
          name="questRegions"
          label="퀘스트 대상 지역"
          placeholder="전체 지역"
          isDisabled={forEdit}
          filterOption={(option, inputValue) => option.label.includes(inputValue)}
          options={emdOptions}
        />
        <Combobox
          isMulti
          name="questActions"
          label="퀘스트 대상 액션"
          placeholder="이 행동을 하면 퀘스트로 인정됩니다."
          closeMenuOnSelect={false}
          isDisabled={forEdit}
          rules={{ required: { value: true, message: "1개 이상의 조건을 선택해주세요." } }}
          options={actionOptions}
        />
        <TextInput name="description" label="설명" />
      </form>
    </FormProvider>
  )
}

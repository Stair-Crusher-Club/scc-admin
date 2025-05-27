"use client"

import { FileInput } from "@reactleaf/input"
import { Autocomplete, Combobox, DateInput, NumberInput, TextInput } from "@reactleaf/input/hookform"
import { format } from "date-fns"
import { ChangeEventHandler, useEffect, useState } from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { getImageUploadUrls } from "@/lib/apis/api"
import { http } from "@/lib/http"

import RemoteImage from "@/components/RemoteImage"
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
  crusherGroupName?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
}

export const defaultValues: Partial<ChallengeFormValues> = {
  name: "",
  inviteCode: "",
  joinCode: "",
  startDate: format(new Date(), "yyyy-MM-dd HH:mm"),
  questActions: actionOptions,
  description: "",
  crusherGroupName: "",
  imageUrl: "",
  imageWidth: undefined,
  imageHeight: undefined,
}

interface Props {
  form: UseFormReturn<ChallengeFormValues>
  id?: string
  disabled?: boolean
  onSubmit?: (values: ChallengeFormValues) => void
}
export default function ChallengeForm({ form, id, disabled, onSubmit }: Props) {
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
    form.setValue(
      "milestones",
      milestones?.sort((a, b) => parseInt(a.value) - parseInt(b.value)),
    )
  }, [stringifiedMilestones])

  const [imageUrl, setImageUrl] = useState(form.getValues("imageUrl") || "")
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e?.target?.files) {
      return
    }
    const selectedFile = e!.target.files[0]

    if (selectedFile) {
      getImageUploadUrls({
        purposeType: "CRUSHER_LABEL",
        count: 1,
        filenameExtension: selectedFile.name.split(".").pop()!,
      }).then(async (result) => {
        const uploadUrl = result.urls[0].url
        await http(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": selectedFile.type,
            "x-amz-acl": "public-read",
          },
          body: selectedFile,
          credentials: "omit", // presigned URL에 요청을 보낼 때는 이미 URL에 인증 정보가 담겨 있으므로 별도로 인증 정보를 담아서 보내면 안 된다.
        })
        const removeQueryParamFromUrl = (url: string) => {
          const urlObj = new URL(url)
          urlObj.search = ""
          return urlObj.toString()
        }
        const uploadedImageUrl = removeQueryParamFromUrl(uploadUrl)
        setImageUrl(uploadedImageUrl)
        form.setValue("imageUrl", uploadedImageUrl)
      })
    }
  }

  return (
    <FormProvider {...form}>
      <form id={id} className={css({ width: "50rem" })} onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
        <TextInput
          name="name"
          label="이름"
          rules={{ required: { value: true, message: "챌린지 이름을 입력해주세요" } }}
          disabled={disabled}
        />
        <Flex gap={16}>
          <TextInput
            name="inviteCode"
            label="초대코드"
            placeholder="초대코드를 입력하면 비공개 챌린지가 됩니다."
            disabled={disabled}
          />
          <TextInput
            name="joinCode"
            label="참여코드"
            placeholder="챌린지에 참여할 때 입력해야 하는 암호입니다."
            disabled={disabled}
          />
        </Flex>
        <Flex gap={16}>
          <DateInput name="startDate" label="챌린지 시작" dateFormat="yyyy-MM-dd HH:mm" disabled={disabled} />
          <DateInput
            name="endDate"
            label="챌린지 종료"
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="비워두면 무기한으로 적용됩니다."
            disabled={disabled}
          />
        </Flex>
        <Autocomplete
          isMulti
          name="milestones"
          label="마일스톤"
          placeholder="가장 큰 숫자가 목표로 지정됩니다."
          isDisabled={disabled}
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
          isDisabled={disabled}
          filterOption={(option, inputValue) => option.label.includes(inputValue)}
          options={emdOptions}
        />
        <Combobox
          isMulti
          name="questActions"
          label="퀘스트 대상 액션"
          placeholder="이 행동을 하면 퀘스트로 인정됩니다."
          closeMenuOnSelect={false}
          isDisabled={disabled}
          rules={{ required: { value: true, message: "1개 이상의 조건을 선택해주세요." } }}
          options={actionOptions}
        />
        <TextInput name="description" label="설명" disabled={disabled} />
        <Flex gap={16}>
          <TextInput
            name="crusherGroupName"
            label="파트너 라벨 이름"
            placeholder="파트너 라벨로 사용하고 싶은 이름을 입력하세요"
            disabled={disabled}
          />
          <FileInput label="파트너 라벨 이미지" accept="image/*" onChange={handleFileChange} disabled={disabled} />
          {imageUrl ? <RemoteImage src={imageUrl} width={200} /> : null}
        </Flex>
        <Flex gap={16}>
          <NumberInput
            name="imageWidth"
            label="이미지 넓이(px)"
            disabled={disabled}
            placeholder="이미지의 넓이(px)를 입력하세요"
            rules={{
              validate: (value) => {
                const url = form.getValues("imageUrl")
                if (url && url !== "" && (!value || value <= 0)) {
                  return "이미지의 넓이를 입력하세요"
                }
                return true
              },
            }}
          />
          <NumberInput
            name="imageHeight"
            label="이미지 높이(px)"
            disabled={disabled}
            placeholder="이미지의 높이(px)를 입력하세요"
            rules={{
              validate: (value) => {
                const url = form.getValues("imageUrl")
                if (url && url !== "" && (!value || value <= 0)) {
                  return "이미지의 높이를 입력하세요"
                }
                return true
              },
            }}
          />
        </Flex>
      </form>
    </FormProvider>
  )
}

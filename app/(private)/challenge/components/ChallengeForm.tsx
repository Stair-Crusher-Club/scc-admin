"use client"

import { FileInput } from "@reactleaf/input"
import { Autocomplete, Combobox, DateInput, NumberInput, TextInput } from "@reactleaf/input/hookform"
import axios from "axios"
import { ChangeEventHandler, useEffect, useState } from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { getImageUploadUrls } from "@/lib/apis/api"

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
  { label: "장소 리뷰", value: "PLACE_REVIEW" } as const,
]

export interface ChallengeFormValues {
  name: string
  inviteCode: string
  joinCode: string
  startDate: Date
  endDate: Date | null
  milestones: Option[]
  questActions: Option[]
  questRegions: Option[]
  description: string
  isB2B: boolean
  crusherGroupName?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
}

export const defaultValues: Partial<ChallengeFormValues> = {
  name: "",
  inviteCode: "",
  joinCode: "",
  startDate: new Date(),
  endDate: null,
  questActions: actionOptions,
  description: "",
  isB2B: false,
  crusherGroupName: "",
  imageUrl: "",
  imageWidth: undefined,
  imageHeight: undefined,
}

interface Props {
  form: UseFormReturn<ChallengeFormValues>
  id?: string
  isEditMode?: boolean
  onSubmit?: (values: ChallengeFormValues) => void
}
export default function ChallengeForm({ form, id, isEditMode, onSubmit }: Props) {
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

  const [imageUrl, setImageUrl] = useState("")
  const [showImage, setShowImage] = useState(false)
  const formImageUrl = form.watch("imageUrl")
  useEffect(() => {
    if (formImageUrl && formImageUrl !== "") {
      setImageUrl(formImageUrl)
      setShowImage(true)
    } else {
      setImageUrl("")
      setShowImage(false)
    }
  }, [formImageUrl])

  async function getImageSize(url: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.onload = () => resolve([img.width, img.height])
      img.onerror = reject
    })
  }

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
        await axios.put(uploadUrl, selectedFile, {
          headers: {
            "Content-Type": selectedFile.type,
            "x-amz-acl": "public-read",
          },
          withCredentials: false,
        })
        const removeQueryParamFromUrl = (url: string) => {
          const urlObj = new URL(url)
          urlObj.search = ""
          return urlObj.toString()
        }
        const uploadedImageUrl = removeQueryParamFromUrl(uploadUrl)
        setImageUrl(uploadedImageUrl)
        form.setValue("imageUrl", uploadedImageUrl)

        const [imageWidth, imageHeight]: number[] = await getImageSize(uploadedImageUrl)
        form.setValue("imageWidth", imageWidth)
        form.setValue("imageHeight", imageHeight)
      })
    }
  }

  const isEditableFieldDisabled = isEditMode === undefined ? false : !isEditMode
  const isNotEditableFieldDisabled = isEditMode === undefined ? false : true

  return (
    <FormProvider {...form}>
      <form id={id} className={css({ width: "50rem" })} onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
        <TextInput
          name="name"
          label="이름"
          rules={{ required: { value: true, message: "챌린지 이름을 입력해주세요" } }}
          disabled={isEditableFieldDisabled}
        />
        <Flex gap={16}>
          <TextInput
            name="inviteCode"
            label="초대코드"
            placeholder="초대코드를 입력하면 비공개 챌린지가 됩니다."
            disabled={isNotEditableFieldDisabled}
          />
          <TextInput
            name="joinCode"
            label="참여코드"
            placeholder="챌린지에 참여할 때 입력해야 하는 암호입니다."
            disabled={isNotEditableFieldDisabled}
          />
        </Flex>
        <Flex gap={16}>
          <DateInput
            name="startDate"
            label="챌린지 시작"
            dateFormat="yyyy-MM-dd HH:mm"
            showTimeSelect={true}
            disabled={isNotEditableFieldDisabled}
          />
          <DateInput
            name="endDate"
            label="챌린지 종료"
            dateFormat="yyyy-MM-dd HH:mm"
            showTimeSelect={true}
            placeholderText="비워두면 무기한으로 적용됩니다."
            disabled={isEditableFieldDisabled}
          />
        </Flex>
        <Autocomplete
          isMulti
          name="milestones"
          label="마일스톤"
          placeholder="가장 큰 숫자가 목표로 지정됩니다."
          isDisabled={isNotEditableFieldDisabled}
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
          isDisabled={isNotEditableFieldDisabled}
          filterOption={(option, inputValue) => option.label.includes(inputValue)}
          options={emdOptions}
        />
        <Combobox
          isMulti
          name="questActions"
          label="퀘스트 대상 액션"
          placeholder="이 행동을 하면 퀘스트로 인정됩니다."
          closeMenuOnSelect={false}
          isDisabled={isNotEditableFieldDisabled}
          rules={{ required: { value: true, message: "1개 이상의 조건을 선택해주세요." } }}
          options={actionOptions}
        />
        <div>
          <label htmlFor="description" className={css({ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "4px" })}>
            설명 (Markdown 지원)
          </label>
          <textarea
            {...form.register("description")}
            id="description"
            placeholder="챌린지에 대한 설명을 입력하세요. **굵은글씨**, *기울임*, `코드` 등 Markdown 문법을 사용할 수 있습니다."
            disabled={isEditableFieldDisabled}
            className={css({
              width: "100%",
              minHeight: "120px",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              lineHeight: "1.5",
              resize: "vertical",
              fontFamily: "inherit",
              _focus: {
                outline: "none",
                borderColor: "#3b82f6",
                boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
              },
              _disabled: {
                backgroundColor: "#f9fafb",
                color: "#6b7280",
                cursor: "not-allowed",
              },
            })}
          />
          <div className={css({ fontSize: "12px", color: "#6b7280", marginTop: "4px" })}>
            줄바꿈은 엔터키로 가능하며, Markdown 문법을 사용하여 텍스트를 꾸밀 수 있습니다.
          </div>
        </div>
        <div className={css({ marginBottom: "16px" })}>
          <label className={css({ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" })}>
            <input
              type="checkbox"
              {...form.register("isB2B")}
              disabled={isEditableFieldDisabled}
              className={css({
                width: "18px",
                height: "18px",
                cursor: "pointer",
                _disabled: {
                  cursor: "not-allowed",
                },
              })}
            />
            <span className={css({ fontSize: "14px", fontWeight: "500" })}>B2B 챌린지</span>
          </label>
          <div className={css({ fontSize: "12px", color: "#6b7280", marginTop: "4px", marginLeft: "26px" })}>
            B2B(기업용) 챌린지인 경우 체크하세요.
          </div>
        </div>
        <TextInput
          name="crusherGroupName"
          label="파트너 라벨 이름"
          placeholder="파트너 라벨로 사용하고 싶은 이름을 입력하세요"
          disabled={isEditableFieldDisabled}
        />
        <Flex direction={showImage ? "row" : "column"}>
          <div className={css({ width: showImage ? "50%" : "100%" })}>
            <FileInput
              label="파트너 라벨 이미지"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isEditableFieldDisabled}
            />
          </div>
          {showImage && (
            <div
              className={css({
                width: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 4,
                marginBottom: 12,
                backgroundColor: "#ffffff",
                position: "relative",
              })}
            >
              <RemoteImage
                src={imageUrl}
                width={(form.watch("imageWidth")!! / form.watch("imageHeight")!!) * 28}
                height={28}
                className={css({
                  height: "28px",
                  border: "1px solid #000000",
                  objectFit: "contain",
                })}
              />
            </div>
          )}
        </Flex>
      </form>
    </FormProvider>
  )
}

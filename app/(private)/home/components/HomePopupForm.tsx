"use client"

import { FileInput } from "@reactleaf/input"
import { DateInput, NumberInput } from "@reactleaf/input/hookform"
import axios from "axios"
import { ChangeEventHandler, useState } from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { getImageUploadUrls } from "@/lib/apis/api"

import RemoteImage from "@/components/RemoteImage"
import { css } from "@/styles/css"
import { Flex } from "@/styles/jsx"

export interface HomePopupFormValues {
  imageUrl: string
  displayOrder: number
  startDate?: string
  endDate?: string
}

export const defaultValues: Partial<HomePopupFormValues> = {
  imageUrl: "",
  displayOrder: 0,
  startDate: "",
  endDate: "",
}

interface Props {
  form: UseFormReturn<HomePopupFormValues>
  id?: string
  disabled?: boolean
  onSubmit?: (values: HomePopupFormValues) => void
}

export default function HomePopupForm({ form, id, disabled, onSubmit }: Props) {
  const [imageUrl, setImageUrl] = useState("")
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e?.target?.files) {
      return
    }
    const selectedFile = e!.target.files[0]

    if (selectedFile) {
      getImageUploadUrls({
        purposeType: "HOME_POPUP",
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
      })
    }
  }

  return (
    <FormProvider {...form}>
      <form id={id} className={css({ width: "50rem" })} onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
        <Flex gap={16}>
          <Flex flexDirection="column" flex={1}>
            <FileInput label="팝업 이미지" accept="image/*" onChange={handleFileChange} disabled={disabled} />
            {imageUrl ? <RemoteImage src={imageUrl} width={400} /> : null}
          </Flex>
        </Flex>
        <Flex gap={16}>
          <DateInput
            name="startDate"
            label="팝업 노출 시작"
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="비워두면 즉시 노출이 시작됩니다."
            disabled={disabled}
          />
          <DateInput
            name="endDate"
            label="팝업 노출 종료"
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="비워두면 무기한으로 노출됩니다."
            disabled={disabled}
          />
        </Flex>
        <Flex gap={16}>
          <NumberInput name="displayOrder" label="노출 순서 (작을수록 위에 노출)" disabled={disabled} />
        </Flex>
      </form>
    </FormProvider>
  )
}

"use client"

import { FileInput } from "@reactleaf/input"
import { DateInput, NumberInput, TextInput } from "@reactleaf/input/hookform"
import { format } from "date-fns"
import { ChangeEventHandler, useState } from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { getImageUploadUrls } from "@/lib/apis/api"
import { http } from "@/lib/http"

import RemoteImage from "@/components/RemoteImage"
import { css } from "@/styles/css"
import { Flex } from "@/styles/jsx"

export interface BannerFormValues {
  loggingKey: string
  imageUrl: string
  clickPageUrl: string
  clickPageTitle: string
  startDate?: string
  endDate?: string
  displayOrder: number
}

export const defaultValues: Partial<BannerFormValues> = {
  loggingKey: "",
  imageUrl: "",
  clickPageUrl: "",
  clickPageTitle: "",
  startDate: format(new Date(), "yyyy-MM-dd HH:mm"),
  endDate: format(new Date(), "yyyy-MM-dd HH:mm"),
  displayOrder: 0,
}

interface Props {
  form: UseFormReturn<BannerFormValues>
  id?: string
  disabled?: boolean
  onSubmit?: (values: BannerFormValues) => void
}

export default function BannerForm({ form, id, disabled, onSubmit }: Props) {
  const [imageUrl, setImageUrl] = useState("")
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e?.target?.files) {
      return
    }
    const selectedFile = e!.target.files[0]

    if (selectedFile) {
      getImageUploadUrls({
        purposeType: "BANNER",
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
          urlObj.search = ''
          return urlObj.toString()
        }

        const uploadedImageUrl = removeQueryParamFromUrl(uploadUrl)
        setImageUrl(uploadedImageUrl)
        form.setValue("imageUrl", uploadedImageUrl);
      })
    }
  }

  return (
    <FormProvider {...form}>
      <form id={id} className={css({ width: "50rem" })} onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}>
        <Flex gap={16}>
          <Flex flex={1}>
            <TextInput
              name="loggingKey"
              label="로깅 키"
              rules={{ required: { value: true, message: "로깅 키를 입력해주세요" } }}
              disabled={disabled}
              placeholder="example_logging_key"
            />
          </Flex>
          <Flex flexDirection="column" flex={1}>
            <FileInput label="배너 사진" accept="image/*" onChange={handleFileChange} />
            {imageUrl ? <RemoteImage src={imageUrl} width={400} /> : null}
          </Flex>
        </Flex>
        <Flex gap={16}>
          <TextInput name="clickPageTitle" label="랜딩 페이지 제목" disabled={disabled} />
          <TextInput name="clickPageUrl" label="랜딩 페이지 링크" disabled={disabled} />
        </Flex>
        <Flex gap={16}>
          <DateInput
            name="startDate"
            label="배너 노출 시작"
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="비워두면 즉시 노출이 시작됩니다."
            disabled={disabled}
          />
          <DateInput
            name="endDate"
            label="배너 노출 종료"
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

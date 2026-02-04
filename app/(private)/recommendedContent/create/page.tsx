"use client"

import { FileInput } from "@reactleaf/input"
import { DateInput, NumberInput, TextInput } from "@reactleaf/input/hookform"
import axios from "axios"
import { format } from "date-fns"
import { ChangeEventHandler, useState } from "react"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { Contents } from "@/components/layout"
import RemoteImage from "@/components/RemoteImage"
import { Button } from "@/components/ui/button"
import { getImageUploadUrls } from "@/lib/apis/api"
import { css } from "@/styles/css"
import { Flex } from "@/styles/jsx"

import { createHomeRecommendedContent } from "../query"

interface FormValues {
  title: string
  description: string
  imageUrl: string
  linkUrl: string
  displayOrder: number
  startDate?: string
  endDate?: string
}

const defaultValues: Partial<FormValues> = {
  title: "",
  description: "",
  imageUrl: "",
  linkUrl: "",
  displayOrder: 0,
  startDate: format(new Date(), "yyyy-MM-dd HH:mm"),
  endDate: format(new Date(), "yyyy-MM-dd HH:mm"),
}

export default function CreateRecommendedContent() {
  const router = useRouter()
  const form = useForm<FormValues>({ defaultValues })
  const [imageUrl, setImageUrl] = useState("")

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e?.target?.files) {
      return
    }
    const selectedFile = e!.target.files[0]

    if (selectedFile) {
      getImageUploadUrls({
        purposeType: "RECOMMENDED_CONTENT",
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

  async function onSubmit(values: FormValues) {
    const { title, description, imageUrl, linkUrl, displayOrder, startDate, endDate } = values

    const res = await createHomeRecommendedContent({
      title,
      description,
      imageUrl,
      linkUrl,
      displayOrder,
      startAt: startDate ? { value: new Date(startDate).getTime() } : undefined,
      endAt: endDate ? { value: new Date(endDate).getTime() } : undefined,
    })

    if (res.status !== 204) {
      toast.error("추천 컨텐츠 생성에 실패했습니다.")
      return
    }
    toast.success("추천 컨텐츠가 생성되었습니다.")
    router.push("/recommendedContent")
  }

  return (
    <Contents.Normal>
      <FormProvider {...form}>
        <form id="create-recommended-content" className={css({ width: "50rem" })} onSubmit={form.handleSubmit(onSubmit)}>
          <Flex gap={16}>
            <TextInput
              name="title"
              label="제목"
              rules={{ required: { value: true, message: "제목을 입력해주세요" } }}
              placeholder="크러셔님을 위한 추천 장소"
            />
          </Flex>
          <Flex gap={16}>
            <TextInput
              name="description"
              label="설명"
              rules={{ required: { value: true, message: "설명을 입력해주세요" } }}
              placeholder="서울에서 휠체어로 갈 수 있는 카페"
            />
          </Flex>
          <Flex gap={16}>
            <Flex flex={1}>
              <TextInput
                name="linkUrl"
                label="클릭 시 이동할 URL"
                rules={{ required: { value: true, message: "URL을 입력해주세요" } }}
                placeholder="https://example.com 또는 딥링크"
              />
            </Flex>
            <Flex flexDirection="column" flex={1}>
              <FileInput label="이미지" accept="image/*" onChange={handleFileChange} />
              {imageUrl ? <RemoteImage src={imageUrl} width={200} /> : null}
            </Flex>
          </Flex>
          <Flex gap={16}>
            <DateInput
              name="startDate"
              label="노출 시작"
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="비워두면 즉시 노출이 시작됩니다."
            />
            <DateInput
              name="endDate"
              label="노출 종료"
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="비워두면 무기한으로 노출됩니다."
            />
          </Flex>
          <Flex gap={16}>
            <NumberInput name="displayOrder" label="노출 순서 (작을수록 위에 노출)" />
          </Flex>
        </form>
      </FormProvider>
      <Button type="submit" form="create-recommended-content" className={css({ marginTop: "16px" })}>
        생성
      </Button>
    </Contents.Normal>
  )
}

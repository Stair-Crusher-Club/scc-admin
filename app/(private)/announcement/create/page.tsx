"use client"

import { DateInput, NumberInput, TextInput } from "@reactleaf/input/hookform"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { Contents } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { css } from "@/styles/css"
import { Flex } from "@/styles/jsx"

import { createHomeAnnouncement } from "../query"

interface FormValues {
  text: string
  linkUrl: string
  displayOrder: number
  startDate?: string
  endDate?: string
}

const defaultValues: Partial<FormValues> = {
  text: "",
  linkUrl: "",
  displayOrder: 0,
  startDate: format(new Date(), "yyyy-MM-dd HH:mm"),
  endDate: format(new Date(), "yyyy-MM-dd HH:mm"),
}

export default function CreateAnnouncement() {
  const router = useRouter()
  const form = useForm<FormValues>({ defaultValues })

  async function onSubmit(values: FormValues) {
    const { text, linkUrl, displayOrder, startDate, endDate } = values

    const res = await createHomeAnnouncement({
      text,
      linkUrl,
      displayOrder,
      startAt: startDate ? { value: new Date(startDate).getTime() } : undefined,
      endAt: endDate ? { value: new Date(endDate).getTime() } : undefined,
    })

    if (res.status !== 200) {
      toast.error("공지사항 생성에 실패했습니다.")
      return
    }
    toast.success("공지사항이 생성되었습니다.")
    router.push("/announcement")
  }

  return (
    <Contents.Normal>
      <FormProvider {...form}>
        <form id="create-announcement" className={css({ width: "50rem" })} onSubmit={form.handleSubmit(onSubmit)}>
          <Flex gap={16}>
            <TextInput
              name="text"
              label="공지사항 텍스트"
              rules={{ required: { value: true, message: "텍스트를 입력해주세요" } }}
              placeholder="💌 봄시즌 활동 알림신청 오픈!"
            />
          </Flex>
          <Flex gap={16}>
            <TextInput
              name="linkUrl"
              label="클릭 시 이동할 URL"
              rules={{ required: { value: true, message: "URL을 입력해주세요" } }}
              placeholder="https://example.com"
            />
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
      <Button type="submit" form="create-announcement" className={css({ marginTop: "16px" })}>
        생성
      </Button>
    </Contents.Normal>
  )
}

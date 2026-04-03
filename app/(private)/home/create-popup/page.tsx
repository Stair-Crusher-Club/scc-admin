"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { Contents } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { css } from "@/styles/css"

import HomePopupForm, { HomePopupFormValues, defaultValues } from "../components/HomePopupForm"
import { createHomePopup } from "../query"

export default function CreatePopup() {
  const router = useRouter()
  const form = useForm<HomePopupFormValues>({ defaultValues })

  async function onSubmit(values: HomePopupFormValues) {
    const { imageUrl, displayOrder, startDate, endDate } = values

    if (!imageUrl) {
      toast.error("이미지를 업로드해주세요.")
      return
    }

    try {
      await createHomePopup({
        imageUrl,
        displayOrder,
        startAt: startDate ? { value: new Date(startDate).getTime() } : undefined,
        endAt: endDate ? { value: new Date(endDate).getTime() } : undefined,
      })
      toast.success("팝업이 생성되었습니다.")
      router.push("/home")
    } catch {
      toast.error("팝업 생성에 실패했습니다.")
    }
  }

  return (
    <Contents.Normal>
      <HomePopupForm id="create-popup" form={form} onSubmit={onSubmit} />
      <Button type="submit" form="create-popup" className={css({ marginTop: "16px" })}>
        생성
      </Button>
    </Contents.Normal>
  )
}

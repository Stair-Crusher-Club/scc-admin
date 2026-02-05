"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { createBanner } from "@/(private)/banner/query"
import { Contents } from "@/components/layout"

import BannerForm, { BannerFormValues, defaultValues } from "../components/BannerForm"
import * as S from "./page.style"

export default function CreateBanner() {
  const router = useRouter()

  const form = useForm<BannerFormValues>({ defaultValues })

  async function onSubmit(values: BannerFormValues) {
    const { loggingKey, imageUrl, clickPageUrl, clickPageTitle, startDate, endDate, displayOrder, bannerType } = values

    const res = await createBanner({
      loggingKey,
      imageUrl,
      clickPageUrl,
      clickPageTitle,
      startAt: startDate ? { value: new Date(startDate).getTime() } : undefined,
      endAt: endDate ? { value: new Date(endDate).getTime() } : undefined,
      displayOrder,
      bannerType,
    })

    if (res.status !== 200) {
      toast.error("배너 생성에 실패했습니다.")
      return
    }
    toast.success("배너가 생성되었습니다.")
    router.push("/banner")
  }

  return (
    <>
      <Contents.Normal>
        <BannerForm id="create-banner" form={form} onSubmit={onSubmit} />
        <S.SubmitButton type="submit" form="create-banner">
          생성
        </S.SubmitButton>
      </Contents.Normal>
    </>
  )
}

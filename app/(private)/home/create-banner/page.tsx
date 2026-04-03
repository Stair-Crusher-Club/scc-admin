"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { createBanner } from "@/(private)/home/query"
import { Contents } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { css } from "@/styles/css"

import BannerForm, { BannerFormValues, defaultValues } from "../components/BannerForm"

export default function CreateBanner() {
  const router = useRouter()

  const form = useForm<BannerFormValues>({ defaultValues })

  async function onSubmit(values: BannerFormValues) {
    const { loggingKey, imageUrl, clickPageUrl, clickPageTitle, startDate, endDate, displayOrder, bannerType } = values

    try {
      await createBanner({
        loggingKey,
        imageUrl,
        clickPageUrl,
        clickPageTitle,
        startAt: startDate ? { value: new Date(startDate).getTime() } : undefined,
        endAt: endDate ? { value: new Date(endDate).getTime() } : undefined,
        displayOrder,
        bannerType,
      })
      toast.success("배너가 생성되었습니다.")
      router.push("/home")
    } catch {
      toast.error("배너 생성에 실패했습니다.")
    }
  }

  return (
    <Contents.Normal>
      <BannerForm id="create-banner" form={form} onSubmit={onSubmit} />
      <Button type="submit" form="create-banner" className={css({ marginTop: "16px" })}>
        생성
      </Button>
    </Contents.Normal>
  )
}

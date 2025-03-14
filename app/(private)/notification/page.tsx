"use client"

import { TextInput } from "@reactleaf/input/hookform"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { PushNotification, SendPushNotificationPayload, sendPushNotification } from "@/lib/apis/api"

import { Contents, Header } from "@/components/layout"
import { Flex } from "@/styles/jsx"

import * as S from "./page.style"

export default function NotificationPage() {
  interface SendPushNotificationFormValues {
    userIds: string
    title?: string
    body: string
    deepLink?: string
  }

  const form = useForm<SendPushNotificationFormValues>({
    defaultValues: {
      userIds: "",
      title: "",
      body: "",
      deepLink: "",
    },
  })

  async function handleSendPushNotification(formValues: SendPushNotificationFormValues) {
    try {
      let titleToUse
      if (formValues.title && formValues.title?.length > 0) {
        titleToUse = formValues.title
      } else {
        titleToUse = undefined
      }

      const notification: PushNotification = {
        title: titleToUse,
        body: formValues.body,
        deepLink: undefined,
      }

      const payload: SendPushNotificationPayload = {
        userIds: formValues.userIds.split(",").map((id) => id.trim()),
        notification: notification,
      }

      const res = await sendPushNotification(payload)
      if (res.status != 200) {
        throw new Error("Failed to send notification")
      }

      toast.success("푸시 알림을 발송했습니다.")
      form.reset()
    } catch (error) {
      console.error("Failed to send notification:", error)
      toast.error("푸시 알림 발송에 실패했습니다.")
    }
  }

  return (
    <>
      <Header title="푸시 알림 발송" />
      <Contents.Normal>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSendPushNotification)}>
            <Flex direction={"column"}>
              <S.InputTitle>유저 ID (여러명의 경우 쉼표(,)로 구분해주세요):</S.InputTitle>
              <S.Textarea
                placeholder="타겟 유저 ID"
                {...form.register("userIds", { required: "푸시 알림 수신자를 입력하세요." })}
              />
              <S.ErrorMessage>{form.formState.errors?.userIds?.message}</S.ErrorMessage>
            </Flex>

            <S.InputTitle>제목:</S.InputTitle>
            <TextInput type="text" name="title" placeholder="푸시 알림 제목" />

            <S.InputTitle>본문:</S.InputTitle>
            <TextInput type="text" name="body" placeholder="푸시 알림 본문" required={true} />

            <S.InputTitle>딥링크:</S.InputTitle>
            {/* TODO: 사용 가능한 딥링크를 드롭다운 형식으로 제공하기 */}
            <TextInput type="text" name="deepLink" placeholder="딥링크" disabled={true} />

            <S.Button type="submit">푸시 알림 보내기</S.Button>
          </form>
        </FormProvider>
      </Contents.Normal>
    </>
  )
}

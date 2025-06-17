"use client"

import { Combobox, TextInput } from "@reactleaf/input/hookform"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { PushNotification, SendPushNotificationPayload, sendPushNotification } from "@/lib/apis/api"

import { Contents, Header } from "@/components/layout"
import { Flex } from "@/styles/jsx"

import * as S from "./page.style"

interface Option {
  label: string
  value: string
}

interface DeepLinkOption extends Option {
  isArgumentRequired: boolean
}

interface WebviewOption extends Option {
  fixedTitle: string
  headerVariant: string
}

const deepLinkOptions: DeepLinkOption[] = [
  { label: "홈", value: "stair-crusher://", isArgumentRequired: false },
  { label: "프로필", value: "stair-crusher://profile", isArgumentRequired: false },
  { label: "설정", value: "stair-crusher://setting", isArgumentRequired: false },
  { label: "장소", value: "stair-crusher://place", isArgumentRequired: true },
  { label: "챌린지", value: "stair-crusher://challenge", isArgumentRequired: true },
  { label: "웹뷰", value: "stair-crusher://webview", isArgumentRequired: false },
]

const headerVariantOptions: Option[] = [
  { label: "브라우저처럼 열리도록 (상단에 X 버튼이 있다)", value: "appbar" },
  { label: "앱 내부처럼 보이도록 (상단에 뒤로가기 버튼이 있다)", value: "navigation" },
]

const predefinedWebviews: WebviewOption[] = [
  {
    label: "정보 등록/조회 가이드",
    value: "https://admin.staircrusher.club/public/guide?tab=register",
    fixedTitle: "정보 등록/조회 가이드",
    headerVariant: "navigation",
  },
]

const createWebviewDeepLink = (url: string, fixedTitle: string, headerVariant: string): string => {
  return `stair-crusher://webview?url=${encodeURIComponent(url)}&fixedTitle=${encodeURIComponent(fixedTitle)}&headerVariant=${encodeURIComponent(headerVariant)}`
}

export default function NotificationPage() {
  interface SendPushNotificationFormValues {
    userIds: string
    title?: string
    body: string
    deepLink?: DeepLinkOption
    deepLinkArgument?: string
    webviewUrl?: string
    webviewFixedTitle?: string
    webviewHeaderVariant?: Option
  }

  const form = useForm<SendPushNotificationFormValues>({
    defaultValues: {
      userIds: "",
      title: "",
      body: "",
      deepLink: deepLinkOptions[0],
      deepLinkArgument: "",
      webviewUrl: "",
      webviewFixedTitle: "",
      webviewHeaderVariant: undefined,
    },
  })

  const handlePredefinedWebviewChange = (option: any) => {
    const typedOption = option as WebviewOption
    if (!typedOption || !typedOption.value) {
      form.setValue("webviewUrl", "")
      form.setValue("webviewFixedTitle", "")
      form.setValue("webviewHeaderVariant", undefined)
      return
    }
    form.setValue("webviewUrl", typedOption.value)
    form.setValue("webviewFixedTitle", typedOption.fixedTitle)
    form.setValue(
      "webviewHeaderVariant",
      headerVariantOptions.find((option) => option.value === typedOption.headerVariant),
    )
  }

  async function handleSendPushNotification(formValues: SendPushNotificationFormValues) {
    try {
      let titleToUse
      if (formValues.title && formValues.title?.length > 0) {
        titleToUse = formValues.title
      } else {
        titleToUse = undefined
      }

      let deepLinkToUse
      if (formValues.deepLink && formValues.deepLink.value.length > 0) {
        if (formValues.deepLink.value === "stair-crusher://webview") {
          // Validate webview fields
          if (!formValues.webviewUrl || !formValues.webviewFixedTitle || !formValues.webviewHeaderVariant) {
            toast.error("웹뷰 URL, 고정 제목, 헤더 타입을 모두 입력하세요.")
            return
          }
          deepLinkToUse = createWebviewDeepLink(
            formValues.webviewUrl,
            formValues.webviewFixedTitle,
            formValues.webviewHeaderVariant.value,
          )
        } else if (formValues.deepLink.isArgumentRequired) {
          if (!formValues.deepLinkArgument || formValues.deepLinkArgument.length === 0) {
            toast.error("딥링크 상세 정보를 입력하세요.")
            return
          } else {
            deepLinkToUse = `${formValues.deepLink.value}/${formValues.deepLinkArgument}`
          }
        } else {
          deepLinkToUse = formValues.deepLink.value
        }
      } else {
        deepLinkToUse = undefined
      }

      const notification: PushNotification = {
        title: titleToUse,
        body: formValues.body,
        deepLink: deepLinkToUse,
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

  const deepLinkWatch = form.watch("deepLink")

  return (
    <>
      <Header title="푸시 알림 발송" />
      <Contents.Normal>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSendPushNotification)}>
            <Flex direction={"column"}>
              <S.InputTitle>유저 ID</S.InputTitle>
              <S.InputDescription>* scc_user 테이블의 user_id 혹은 user_account 테이블의 id 값</S.InputDescription>
              <S.InputDescription>* 여러 명에게 보내려면 쉼표(,)로 구분해주세요</S.InputDescription>
              <S.Textarea
                placeholder="타겟 유저 ID"
                {...form.register("userIds", { required: "푸시 알림 수신자를 입력하세요." })}
              />
              <S.ErrorMessage>{form.formState.errors?.userIds?.message}</S.ErrorMessage>
            </Flex>

            <S.InputTitle>제목</S.InputTitle>
            <TextInput type="text" name="title" placeholder="푸시 알림 제목" />

            <S.InputTitle>본문</S.InputTitle>
            <TextInput type="text" name="body" placeholder="푸시 알림 본문" required={true} />

            <S.InputTitle>딥링크</S.InputTitle>
            <Combobox name="deepLink" options={deepLinkOptions} placeholder="딥링크" />

            {deepLinkWatch && deepLinkWatch.value === "stair-crusher://webview" ? (
              <>
                <S.InputTitle>자주 쓰는 웹뷰 딥링크</S.InputTitle>
                <Combobox
                  name="predefinedWebview"
                  options={predefinedWebviews}
                  placeholder="자주 쓰는 웹뷰 딥링크 선택"
                  onChange={(option) => {
                    handlePredefinedWebviewChange(option)
                  }}
                  isClearable={true}
                />
                <S.InputTitle>웹뷰 URL (url 에 해당하는 부분만 넣어주세요)</S.InputTitle>
                <TextInput type="text" name="webviewUrl" placeholder="웹뷰로 열 URL" required={true} />
                <S.InputTitle>제목</S.InputTitle>
                <TextInput type="text" name="webviewFixedTitle" placeholder="웹뷰 상단 제목" required={true} />
                <S.InputTitle>헤더 타입</S.InputTitle>
                <Combobox
                  name="webviewHeaderVariant"
                  options={headerVariantOptions}
                  placeholder="헤더 타입 선택"
                  required={true}
                />
              </>
            ) : (
              <>
                <S.InputTitle>딥링크 상세 (Ex. 장소 ID, 챌린지 ID)</S.InputTitle>
                <TextInput
                  type="text"
                  name="deepLinkArgument"
                  placeholder="딥링크 상세 정보 (Ex. 장소 ID)"
                  disabled={!deepLinkWatch || !deepLinkWatch.isArgumentRequired}
                />
              </>
            )}

            <S.Button type="submit">푸시 알림 보내기</S.Button>
          </form>
        </FormProvider>
      </Contents.Normal>
    </>
  )
}

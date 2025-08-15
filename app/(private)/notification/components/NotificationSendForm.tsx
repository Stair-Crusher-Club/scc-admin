import { Combobox, DateInput, TextInput } from "@reactleaf/input/hookform"
import React from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { Flex } from "@/styles/jsx"

import * as S from "../page.style"
import {
  DeepLinkOption,
  Option,
  WebviewOption,
  deepLinkOptions,
  headerVariantOptions,
  predefinedWebviews,
} from "./constants"

export interface SendPushNotificationFormValues {
  userIds: string
  title?: string
  body: string
  deepLink?: DeepLinkOption
  deepLinkArgument?: string
  webviewUrl?: string
  webviewFixedTitle?: string
  webviewHeaderVariant?: Option
  scheduleDate?: string
}

interface Props {
  id?: string
  form: UseFormReturn<SendPushNotificationFormValues>
  onSubmit: (values: any) => void
}

export function NotificationSendForm({ id, form, onSubmit }: Props) {
  const deepLinkWatch = form.watch("deepLink")

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

  const countTargetUsers = () => {
    const userIds = form.watch("userIds")
    if (userIds === undefined || userIds.trim() === "") {
      return 0
    }
    const splitUserIds = userIds.split(",").filter((id) => id.trim() !== "")
    return splitUserIds.length
  }

  return (
    <FormProvider {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <Flex direction={"column"}>
          <S.InputTitle>유저 ID</S.InputTitle>
          <S.InputDescription>* scc_user 테이블의 user_id 혹은 user_account 테이블의 id 값</S.InputDescription>
          <S.InputDescription>* 여러 명에게 보내려면 쉼표(,)로 구분해주세요</S.InputDescription>
          <S.Textarea
            placeholder="타겟 유저 ID"
            {...form.register("userIds", { required: "푸시 알림 수신자를 입력하세요." })}
          />
          <S.InputDescription>{countTargetUsers()}명에게 발송</S.InputDescription>
          <S.ErrorMessage>
            {typeof form.formState.errors?.userIds?.message === "string" ? form.formState.errors?.userIds?.message : ""}
          </S.ErrorMessage>
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
              onChange={handlePredefinedWebviewChange}
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

        <S.InputTitle>예약 발송 시각 (10분 단위로 설정 가능)</S.InputTitle>
        <DateInput
          name="scheduleDate"
          dateFormat="yyyy-MM-dd HH:mm"
          showTimeSelect={true}
          timeIntervals={10}
          placeholderText="비워두면 즉시 발송됩니다."
          isClearable={true}
        />

        <S.Button type="submit">푸시 알림 보내기</S.Button>
      </form>
    </FormProvider>
  )
}

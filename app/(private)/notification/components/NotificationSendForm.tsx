import { Combobox, DateInput, TextInput } from "@reactleaf/input/hookform"
import React, { useMemo } from "react"
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
import { QueryParamsInput } from "./QueryParamsInput"
import { buildDeepLinkFromFormValues } from "./deepLinkUtils"

export interface SendPushNotificationFormValues {
  userIds: string
  title?: string
  body: string
  deepLink?: DeepLinkOption
  deepLinkArgument?: string
  queryParams?: { [key: string]: string }
  customDeepLink?: string
  webviewUrl?: string
  webviewFixedTitle?: string
  webviewHeaderVariant?: Option
  scheduleDate?: string
}

export interface ParsedSendPushNotificationFormValues extends Omit<SendPushNotificationFormValues, 'userIds'> {
  parsedUserIds: string[]
}

interface Props {
  id?: string
  form: UseFormReturn<SendPushNotificationFormValues>
  onSubmit: (values: ParsedSendPushNotificationFormValues) => void
}

export function NotificationSendForm({ id, form, onSubmit }: Props) {
  const deepLinkWatch = form.watch("deepLink")
  const formValues = form.watch()
  
  // Calculate deep link preview
  const deepLinkPreview = useMemo(() => {
    return buildDeepLinkFromFormValues(formValues)
  }, [formValues])

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

  const parseUserIds = (userIds: string): string[] => {
    if (!userIds || userIds.trim() === "") {
      return []
    }
    // Split by both comma and newline
    const splitUserIds = userIds
      .split(/[,\n]+/)
      .map((id) => id.trim())
      .filter((id) => id !== "")
    // Remove duplicates
    return [...new Set(splitUserIds)]
  }

  const parsedUserIds = parseUserIds(form.watch("userIds"))
  const userCount = parsedUserIds.length

  const handleSubmit = (values: SendPushNotificationFormValues) => {
    onSubmit({
      ...values,
      parsedUserIds,
    })
  }

  return (
    <FormProvider {...form}>
      <form id={id} onSubmit={form.handleSubmit(handleSubmit)}>
        <Flex direction={"column"}>
          <S.InputTitle>유저 ID</S.InputTitle>
          <S.InputDescription>* scc_user 테이블의 user_id 혹은 user_account 테이블의 id 값</S.InputDescription>
          <S.InputDescription>* 여러 명에게 보내려면 쉼표(,) 또는 엔터로 구분해주세요</S.InputDescription>
          <S.Textarea
            placeholder="타겟 유저 ID (쉼표 또는 엔터로 구분)"
            {...form.register("userIds", { required: "푸시 알림 수신자를 입력하세요." })}
          />
          <S.InputDescription style={{ marginTop: 8, fontWeight: "bold" }}>
            총 {userCount}명에게 발송 예정
          </S.InputDescription>
          {userCount > 0 && (
            <S.InputDescription style={{ marginTop: 4, fontSize: "12px", color: "#666" }}>
              미리보기 (처음 5명): {parsedUserIds.slice(0, 5).join(", ")}
              {userCount > 5 && ` ... 외 ${userCount - 5}명`}
            </S.InputDescription>
          )}
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

        {deepLinkWatch && deepLinkWatch.value === "custom" ? (
          <>
            <S.InputTitle>커스텀 딥링크 URL</S.InputTitle>
            <S.InputDescription>* 전체 딥링크 URL을 입력하세요 (예: stair-crusher://search?searchQuery=카페)</S.InputDescription>
            <TextInput type="text" name="customDeepLink" placeholder="stair-crusher://..." required={true} />
          </>
        ) : deepLinkWatch && deepLinkWatch.value === "stair-crusher://search" ? (
          <QueryParamsInput form={form} fieldName="queryParams" predefinedKeys={deepLinkWatch.queryParams} />
        ) : deepLinkWatch && deepLinkWatch.value === "stair-crusher://webview" ? (
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
        {deepLinkPreview && (
          <>
            <S.InputTitle>딥링크 미리보기</S.InputTitle>
            <S.PreviewBox>
              <S.PreviewLabel>생성될 딥링크:</S.PreviewLabel>
              <S.PreviewContent>{deepLinkPreview}</S.PreviewContent>
            </S.PreviewBox>
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

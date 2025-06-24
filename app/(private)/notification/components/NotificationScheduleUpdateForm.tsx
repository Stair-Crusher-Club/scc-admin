import { Combobox, DateInput, TextInput } from "@reactleaf/input/hookform"
import React from "react"
import { FormProvider, UseFormReturn } from "react-hook-form"

import { UpdateScheduleFormValues, deepLinkOptions, headerVariantOptions, predefinedWebviews } from "../page"
import * as S from "../page.style"

interface Props {
  id: string
  form: UseFormReturn<UpdateScheduleFormValues>
  handlePredefinedWebviewChange: (form: any, option: any) => void
  onSubmit: (values: any) => void
  onCancel: () => void
}

export function NotificationScheduleUpdateForm({ id, form, handlePredefinedWebviewChange, onSubmit, onCancel }: Props) {
  const deepLinkWatch = form.watch("deepLink")

  return (
    <FormProvider {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
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
              onChange={(option) => handlePredefinedWebviewChange(form, option)}
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
          isClearable={false}
        />

        <S.Button type="submit">저장</S.Button>
        <S.Button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>
          취소
        </S.Button>
      </form>
    </FormProvider>
  )
}

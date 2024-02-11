"use client"

import { NumberInput, TextInput } from "@reactleaf/input/hookform"
import { FormProvider, useForm } from "react-hook-form"

import DateInput from "@/components/DateInput/DateInput"

import * as S from "./page.style"

interface FormValues {}

export default function CreateChallenge() {
  const form = useForm()
  function onSubmit() {}

  return (
    <S.Page>
      <S.Header>퀘스트 생성</S.Header>
      <S.Body>
        <S.Form onSubmit={form.handleSubmit(onSubmit)}>
          <FormProvider {...form}>
            <TextInput name="name" label="이름" />
            <TextInput name="inviteCode" label="초대코드" placeholder="초대코드를 입력하면 비공개 챌린지가 됩니다." />
            <TextInput name="joinCode" label="참여코드" placeholder="챌린지에 참여할 때 입력해야 하는 암호입니다." />
            <DateInput name="startDate" label="챌린지 시작" />
            <DateInput name="endDate" label="챌린지 종료" />
            <NumberInput name="name" label="목표 카운트" />
          </FormProvider>
        </S.Form>
      </S.Body>
    </S.Page>
  )
}

"use client"

import { NumberInput, TextInput } from "@reactleaf/input/hookform"
import { FormProvider, useForm } from "react-hook-form"

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
            <TextInput name="name" label="참여코드" />
            <TextInput name="name" label="초대코드" />
            <TextInput name="name" label="시작시각" />
            <TextInput name="name" label="종료시각" />
            <NumberInput name="name" label="목표 카운트" />
          </FormProvider>
        </S.Form>
      </S.Body>
    </S.Page>
  )
}

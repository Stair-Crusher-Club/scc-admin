"use client"

import { TextInput } from "@reactleaf/input/hookform"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { createSearchPreset } from "@/lib/apis/api"

import * as S from "./CreatePresetModal.style"

interface Props {
  open: boolean
  onClose: () => void
}

interface FormValues {
  searchText: string
  description: string
}

export default function CreatePresetModal({ open, onClose }: Props) {
  const form = useForm<FormValues>({
    defaultValues: { searchText: "", description: "" },
  })
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = form

  async function onSubmit(values: FormValues) {
    try {
      if (!values.searchText.trim()) {
        toast.error("검색어는 필수입니다.")
        return
      }
      if (!values.description.trim()) {
        toast.error("설명은 필수입니다.")
        return
      }

      await createSearchPreset(values.searchText, values.description)
      toast.success("검색어가 추가되었습니다.")
      reset()
      onClose()
    } catch (e) {
      toast.error("검색어 추가에 실패했습니다.")
    }
  }

  if (!open) return null

  return (
    <S.Overlay>
      <FormProvider {...form}>
        <S.ModalForm onSubmit={handleSubmit(onSubmit)}>
          <S.Title>검색 프리셋 생성</S.Title>
          <S.Field>
            <TextInput
              name="searchText"
              label="검색어"
              rules={{ required: "검색어는 필수입니다." }}
              disabled={isSubmitting}
              placeholder="검색어를 입력하세요"
            />
          </S.Field>
          <S.Field>
            <TextInput
              name="description"
              label="설명 (앱에서 보이는 이름)"
              rules={{ required: "설명은 필수입니다." }}
              disabled={isSubmitting}
              placeholder="설명을 입력하세요"
            />
          </S.Field>
          <S.ButtonRow>
            <S.Button type="button" onClick={onClose} disabled={isSubmitting} primary={false}>
              취소
            </S.Button>
            <S.Button type="submit" disabled={isSubmitting} primary>
              {isSubmitting ? "생성 중..." : "생성"}
            </S.Button>
          </S.ButtonRow>
        </S.ModalForm>
      </FormProvider>
    </S.Overlay>
  )
}

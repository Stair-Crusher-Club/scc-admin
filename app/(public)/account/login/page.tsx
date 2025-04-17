"use client"

import { PasswordInput, TextInput } from "@reactleaf/input/hookform"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { NetworkError, http } from "@/lib/http"

import { useAuth } from "@/hooks/useAuth"

import * as S from "./page.style"

interface FormValues {
  username: string
  password: string
}
export default function Page() {
  const router = useRouter()
  const form = useForm<FormValues>({ defaultValues: { username: "", password: "" } })
  const { updateToken } = useAuth()

  async function onSubmit(values: FormValues) {
    try {
      const res = await http("/admin/login", {
        method: "POST",
        body: JSON.stringify(values),
      })
      const token = res.headers.get("X-Scc-Access-Key")
      if (!token) return
      updateToken(token)
      router.replace("/")
    } catch (e) {
      if (e instanceof NetworkError) {
        if (e.response.status === 401) {
          toast.error("아이디나 비밀번호가 틀렸습니다.")
        } else {
          toast.error("네트워크 에러")
        }
      } else {
        toast.error("알 수 없는 에러")
      }
    }
  }

  return (
    <S.LoginPage>
      <FormProvider {...form}>
        <S.Form onSubmit={form.handleSubmit(onSubmit)}>
          <TextInput name="username" label="아이디" />
          <PasswordInput name="password" label="비밀번호" onEnter={() => {}} />
          <S.LoginButton type="submit">로그인</S.LoginButton>
        </S.Form>
      </FormProvider>
    </S.LoginPage>
  )
}

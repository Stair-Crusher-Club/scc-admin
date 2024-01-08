"use client"

import { PasswordInput, TextInput } from "@reactleaf/input/hookform"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { http } from "@/lib/http"
import { storage } from "@/lib/storage"

interface FormValues {
  username: string
  password: string
}
export default function Page() {
  const router = useRouter()
  const form = useForm<FormValues>()

  async function onSubmit(values: FormValues) {
    try {
      const res = await http("/admin/login", {
        method: "POST",
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        toast.error("아이디 혹은 비밀번호가 틀립니다.")
        return
      }
      const token = res.headers.get("X-Scc-Access-Key")
      if (!token) return
      storage.set("token", token)
      router.replace("/")
    } catch (e) {
      toast.error("네트워크 에러")
    }
  }

  return (
    <main>
      <FormProvider {...form}>
        <form style={{ width: 200 }} onSubmit={form.handleSubmit(onSubmit)}>
          <TextInput name="username" label="아이디" />
          <PasswordInput name="password" label="비밀번호" onEnter={() => {}} />
          <button type="submit">로그인</button>
        </form>
      </FormProvider>
    </main>
  )
}

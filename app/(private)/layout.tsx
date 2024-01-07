"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { storage } from "@/lib/storage"

import * as S from "@/layout.style"
import Header from "@/layout/Header"
import Sidebar from "@/layout/Sidebar"

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState<boolean>()

  useEffect(() => {
    const token = storage.get("token")
    // TODO: token 유효성 검사. 지금은 일단 있으면 오케이.
    if (token) {
      setAuthenticated(true)
    } else {
      setAuthenticated(false)
      router.replace("/account/login?redirect=" + pathname)
    }
  }, [])

  if (authenticated === undefined) return null
  if (!authenticated) return <div>로그인이 필요합니다.</div>
  return (
    <S.Layout>
      <Sidebar />
      <S.Body>
        <Header />
        {children}
      </S.Body>
    </S.Layout>
  )
}

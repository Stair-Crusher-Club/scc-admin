"use client"

import { useRouter } from "next/navigation"

import { Header } from "@/components/layout"

export default function ChunksPage() {
  const router = useRouter()
  return (
    <>
      <Header title="장소 청크 관리">
        <Header.ActionButton onClick={() => router.push("/chunks/crawl")}>새 청크 불러오기</Header.ActionButton>
      </Header>
    </>
  )
}

"use client"

import { useParams } from "next/navigation"

import { useQuest } from "@/lib/apis/api"

import * as S from "./page.style"

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>()
  const { data } = useQuest({ id })

  return <S.Page></S.Page>
}

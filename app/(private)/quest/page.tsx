"use client"

import Link from "next/link"

import { useQuests } from "@/lib/apis/api"
import { QuestSummary } from "@/lib/models/quest"

import * as S from "./page.style"

export default function QuestList() {
  const { data } = useQuests()
  const quests = data ?? []

  const regrouped = quests.reduce(
    (acc, q) => {
      const key = q.name.split(" - ")[0]
      if (!acc[key]) acc[key] = []
      acc[key].push(q)
      return acc
    },
    {} as Record<string, QuestSummary[]>,
  )

  return (
    <S.Page>
      {Object.entries(regrouped).map(([key, quests]) => (
        <S.Event key={key}>
          <S.EventName>{key}</S.EventName>
          <S.Quests>
            {quests
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map((q) => (
                <Link key={q.id} href={`/quest/${q.id}`}>
                  <S.Quest>{q.name.split(" - ")[1]}</S.Quest>
                </Link>
              ))}
          </S.Quests>
        </S.Event>
      ))}
    </S.Page>
  )
}

"use client"

import { useRouter } from "next/navigation"

import { useChallenges } from "@/lib/apis/api"

import * as S from "./page.style"

export default function ChallengeList() {
  const router = useRouter()
  const { data } = useChallenges()
  const challenges = data ?? []

  return (
    <S.Page>
      <S.PageTitle>
        챌린지 관리<S.PageAction onClick={() => router.push("/challenge/create")}>챌린지 추가</S.PageAction>
      </S.PageTitle>
      <S.Challenges>
        {challenges.map((challenge) => (
          <S.Challenge key={challenge.id} onClick={() => router.push(`/challenge/${challenge.id}`)}>
            {challenge.name}
          </S.Challenge>
        ))}
      </S.Challenges>
    </S.Page>
  )
}

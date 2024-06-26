"use client"

import { useRouter } from "next/navigation"

import { useChallenges } from "@/lib/apis/api"

import { Contents, Header } from "@/components/layout"

import * as S from "./page.style"

export default function ChallengeList() {
  const router = useRouter()
  const { data } = useChallenges()
  const challenges = data ?? []

  return (
    <>
      <Header title="챌린지 관리">
        <Header.ActionButton onClick={() => router.push("/challenge/create")}>챌린지 추가</Header.ActionButton>
      </Header>
      <Contents.Normal>
        <S.Challenges>
          {challenges.map((challenge) => (
            <S.Challenge key={challenge.id} onClick={() => router.push(`/challenge/${challenge.id}`)}>
              {challenge.name}
            </S.Challenge>
          ))}
        </S.Challenges>
      </Contents.Normal>
    </>
  )
}

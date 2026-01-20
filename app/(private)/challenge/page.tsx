"use client"

import { useRouter } from "next/navigation"

import { useChallenges } from "@/lib/apis/api"

import { Contents } from "@/components/layout"
import { Button } from "@/components/ui/button"

import * as S from "./page.style"

export default function ChallengeList() {
  const router = useRouter()
  const { data } = useChallenges()
  const challenges = data ?? []

  return (
    <>
      <Contents.Normal>
        <Button onClick={() => router.push("/challenge/create")} size="sm" className="mb-4">챌린지 추가</Button>
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
